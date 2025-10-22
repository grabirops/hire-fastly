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
    const { profileId } = await req.json();

    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profile, error: profileError } = await supabase
      .from("freelancer_profiles")
      .select("headline, bio, skills")
      .eq("user_id", profileId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Freelancer profile not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    const textToEmbed = `${profile.headline}. ${
      profile.bio
    }. Skills: ${profile.skills?.join(", ")}`;

    const embedding = await generateEmbedding(textToEmbed);

    const { error: updateError } = await supabase
      .from("freelancer_profiles")
      .update({ embedding })
      .eq("user_id", profileId);

    if (updateError) {
      console.error("Error updating profile with embedding:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save embedding" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify({ success: true, profileId }), {
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
