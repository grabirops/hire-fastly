import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { generateEmbedding } from "../../src/lib/embeddings.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(JSON.stringify({ error: "Job ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("title, description, skills, tags")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const textToEmbed = `${job.title}. ${
      job.description
    }. Skills: ${job.skills?.join(", ")}. Tags: ${job.tags?.join(", ")}`;

    const embedding = await generateEmbedding(textToEmbed);

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ embedding })
      .eq("id", jobId);

    if (updateError) {
      console.error("Error updating job with embedding:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save embedding" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify({ success: true, jobId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
