import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { contract_id, rating, text } = await req.json();

    if (!contract_id || !rating) {
      return new Response(
        JSON.stringify({ error: "Contract ID and rating are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Fetch contract to determine target_id and verify author
    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .select("company_id, freela_id, status")
      .eq("id", contract_id)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: "Contract not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    if (contract.status !== "CONCLUIDO") {
      return new Response(
        JSON.stringify({ error: "Contract is not completed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    const isCompany = user.id === contract.company_id;
    const isFreela = user.id === contract.freela_id;

    if (!isCompany && !isFreela) {
      return new Response(
        JSON.stringify({ error: "You are not a participant in this contract" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    const target_id = isCompany ? contract.freela_id : contract.company_id;

    const reviewData = {
      contract_id,
      rating,
      text,
      author_id: user.id,
      target_id,
    };

    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (reviewError) {
      console.error("Error creating review:", reviewError);
      return new Response(
        JSON.stringify({
          error: "Failed to create review",
          details: reviewError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify(newReview), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
