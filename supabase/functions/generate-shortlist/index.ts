import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'jobId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating shortlist for job:', jobId);

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Job found:', job.title);

    const jobSkills = Array.isArray(job.skills) ? job.skills : [];
    const jobSeniority = job.seniority;

    // Fetch all freelancers with profiles
    const { data: freelancers, error: freelancersError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        trust_score,
        freelancer_profiles(*)
      `)
      .eq('role', 'FREELA');

    if (freelancersError) {
      console.error('Error fetching freelancers:', freelancersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch freelancers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${freelancers?.length || 0} freelancers`);

    // Calculate scores for each freelancer
    const scoredFreelancers = (freelancers || [])
      .filter(f => f.freelancer_profiles && f.freelancer_profiles.length > 0)
      .map(freelancer => {
        const profile = freelancer.freelancer_profiles[0];
        const freelaSkills = Array.isArray(profile.skills) ? profile.skills : [];

        // Skill overlap score (0-25%)
        const commonSkills = jobSkills.filter((skill: string) => 
          freelaSkills.some((fs: string) => 
            fs.toLowerCase() === skill.toLowerCase()
          )
        );
        const skillScore = jobSkills.length > 0 
          ? (commonSkills.length / jobSkills.length) * 0.25 
          : 0;

        // Seniority match score (0-15%)
        const seniorityLevels = ['JUNIOR', 'PLENO', 'SENIOR', 'ESPECIALISTA'];
        const jobSenIdx = jobSeniority ? seniorityLevels.indexOf(jobSeniority) : -1;
        const freelaSenIdx = profile.seniority ? seniorityLevels.indexOf(profile.seniority) : -1;
        let seniorityScore = 0;
        if (jobSenIdx >= 0 && freelaSenIdx >= 0) {
          const diff = Math.abs(jobSenIdx - freelaSenIdx);
          seniorityScore = Math.max(0, (3 - diff) / 3) * 0.15;
        }

        // Rate fit score (0-10%)
        let rateScore = 0.05; // Default middle score
        if (profile.rate_hour && job.budget && job.model === 'HORA') {
          const diff = Math.abs(profile.rate_hour - job.budget) / job.budget;
          rateScore = Math.max(0, (1 - diff)) * 0.10;
        }

        // Availability score (0-5%)
        const availabilityScore = profile.availability ? 0.05 : 0.02;

        // Trust score (0-5%)
        const trustScore = (freelancer.trust_score || 0) * 0.05;

        // Total score
        const totalScore = skillScore + seniorityScore + rateScore + availabilityScore + trustScore;

        return {
          freelancer_id: freelancer.id,
          score: totalScore,
          scoreBreakdown: {
            skillMatch: (skillScore * 100 / 0.25).toFixed(0) + '%',
            seniorityMatch: (seniorityScore * 100 / 0.15).toFixed(0) + '%',
            rateMatch: (rateScore * 100 / 0.10).toFixed(0) + '%',
            availability: availabilityScore > 0.03 ? 'Alta' : 'Média',
            trustScore: (trustScore * 100 / 0.05).toFixed(0) + '%'
          }
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5

    console.log(`Shortlist generated with ${scoredFreelancers.length} candidates`);

    // Insert shortlist entries
    const shortlistEntries = scoredFreelancers.map((item, index) => ({
      job_id: jobId,
      freela_id: item.freelancer_id,
      rank: index + 1,
      score_json: item.scoreBreakdown
    }));

    if (shortlistEntries.length > 0) {
      const { error: insertError } = await supabase
        .from('shortlist')
        .insert(shortlistEntries);

      if (insertError) {
        console.error('Error inserting shortlist:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create shortlist', details: insertError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Shortlist created successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: shortlistEntries.length,
        message: 'Shortlist generated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-shortlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
