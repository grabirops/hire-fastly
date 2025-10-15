import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders } from "../_shared/cors.ts";
import { rateLimit, PROPOSAL_LIMIT_CONFIG } from "../_shared/rate-limiter.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Aplicar Rate Limit
    const { limited } = await rateLimit(
      supabase,
      `proposal_user_${user.id}`,
      PROPOSAL_LIMIT_CONFIG
    );
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Limite de propostas diário atingido." }),
        { status: 429, headers: corsHeaders }
      );
    }

    const proposalData = await req.json();

    // Inserir a proposta
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        ...proposalData,
        freela_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
