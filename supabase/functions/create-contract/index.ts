import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${supabaseServiceRoleKey}` },
      },
    });

    const { proposal_id, title, scope, start_date, end_date, milestones } =
      await req.json();

    if (!proposal_id) {
      return new Response(
        JSON.stringify({ error: "Proposal ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select(
        `
        *,
        jobs (
          *,
          profiles (id)
        )
      `
      )
      .eq("id", proposal_id)
      .single();

    if (proposalError || !proposal) {
      console.error("Error fetching proposal:", proposalError);
      return new Response(JSON.stringify({ error: "Proposal not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const job = Array.isArray(proposal.jobs) ? proposal.jobs[0] : proposal.jobs;
    const company = Array.isArray(job.profiles)
      ? job.profiles[0]
      : job.profiles;

    // Basic ownership check (can be enhanced with RLS)
    // const { data: { user } } = await supabase.auth.getUser();
    // if (user.id !== company.id) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     headers: { ...corsHeaders, "Content-Type": "application/json" },
    //     status: 401,
    //   });
    // }

    const contractData = {
      job_id: job.id,
      proposal_id: proposal.id,
      company_id: company.id,
      freela_id: proposal.freela_id,
      title: title || job.title,
      scope: scope || job.description,
      model: job.model,
      total_value: proposal.price,
      start_date,
      end_date,
    };

    const { data: newContract, error: contractError } = await supabase
      .from("contracts")
      .insert(contractData)
      .select()
      .single();

    if (contractError) {
      console.error("Error creating contract:", contractError);
      return new Response(
        JSON.stringify({ error: "Failed to create contract" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Create milestones
    if (milestones && milestones.length > 0) {
      const milestoneData = milestones.map((m, index) => ({
        contract_id: newContract.id,
        description: m.description,
        value: m.value,
        due_date: m.due_date,
        order: index + 1,
      }));

      const { error: milestoneError } = await supabase
        .from("milestones")
        .insert(milestoneData);

      if (milestoneError) {
        console.error("Error creating milestones:", milestoneError);
        // Optional: Rollback contract creation or handle partial success
      }
    }

    return new Response(JSON.stringify(newContract), {
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
