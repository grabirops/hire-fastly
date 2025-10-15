import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders } from "../_shared/cors.ts";
import { calculateRankScore } from "../_shared/ranking.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: "jobId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating shortlist for job:", jobId);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Job not found:", jobError);
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Job found:", job.title);

    // 1. Find similar freelancers using RPC
    const { data: similarFreelas, error: rpcError } = await supabase.rpc(
      "match_freelancers",
      {
        query_embedding: job.embedding,
        match_threshold: 0.5, // limite de similaridade
        match_count: 20, // buscar top 20 inicial
      }
    );

    if (rpcError) {
      console.error("Error fetching similar freelancers:", rpcError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch similar freelancers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const freelaIds = similarFreelas.map((f) => f.profile_id);
    const similarityMap = new Map(
      similarFreelas.map((f) => [f.profile_id, f.similarity])
    );

    // 2. Fetch full profiles for reranking
    const { data: freelancers, error: freelancersError } = await supabase
      .from("profiles")
      .select(
        `
          id, name, trust_score, verif_level,
          freelancer_profiles(*)
      `
      )
      .in("id", freelaIds);

    if (freelancersError) {
      console.error("Error fetching freelancers:", freelancersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch freelancers" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Found ${freelancers?.length || 0} freelancers`);

    // 3. Rerank freelancers
    const scoredFreelancers = freelancers
      .map((freelancer) => {
        const semanticSimilarity = similarityMap.get(freelancer.id) || 0;
        const { score, explanation } = calculateRankScore(
          freelancer,
          job,
          semanticSimilarity
        );
        return {
          freelancer_id: freelancer.id,
          score,
          score_json: explanation,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Pega o top 5 final

    console.log(
      `Shortlist generated with ${scoredFreelancers.length} candidates`
    );

    // Insert shortlist entries
    const shortlistEntries = scoredFreelancers.map((item, index) => ({
      job_id: jobId,
      freela_id: item.freelancer_id,
      rank: index + 1,
      score_json: item.score_json,
    }));

    if (shortlistEntries.length > 0) {
      const { error: insertError } = await supabase
        .from("shortlist")
        .insert(shortlistEntries);

      if (insertError) {
        console.error("Error inserting shortlist:", insertError);
        return new Response(
          JSON.stringify({
            error: "Failed to create shortlist",
            details: insertError,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    console.log("Shortlist created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        count: shortlistEntries.length,
        message: "Shortlist generated successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-shortlist:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
