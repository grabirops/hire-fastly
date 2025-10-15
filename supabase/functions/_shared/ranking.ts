export function calculateRankScore(freelancer, job, semanticSimilarity) {
  const explanation = {};

  // 1. Semantic Similarity (peso: 40%)
  const semanticScore = semanticSimilarity * 0.4;
  explanation.semanticSimilarity = { value: semanticSimilarity, weight: 0.4 };

  // 2. Skill Overlap (peso: 25%)
  const jobSkills = job.skills || [];
  const freelaSkills = freelancer.freelancer_profiles[0]?.skills || [];
  const matchedSkills = freelaSkills.filter((s) =>
    jobSkills.includes(s)
  ).length;
  const skillScoreRaw =
    jobSkills.length > 0 ? matchedSkills / jobSkills.length : 0;
  const skillScore = skillScoreRaw * 0.25;
  explanation.skillMatch = { value: skillScoreRaw, weight: 0.25 };

  // 3. Seniority Match (peso: 15%)
  let seniorityScore = 0;
  if (
    job.seniority &&
    freelancer.freelancer_profiles[0]?.seniority === job.seniority
  ) {
    seniorityScore = 0.15;
  }
  explanation.seniorityMatch = {
    value: seniorityScore > 0 ? 1 : 0,
    weight: 0.15,
  };

  // 4. Rate Fit (peso: 10%)
  const rateFit = 0; // Placeholder
  const rateScore = rateFit * 0.1;
  explanation.rateFit = { value: rateFit, weight: 0.1 };

  // 5. Availability (peso: 5%)
  const availabilityScore =
    (freelancer.freelancer_profiles[0]?.availability ? 1 : 0) * 0.05;
  explanation.availability = {
    value: availabilityScore > 0 ? 1 : 0,
    weight: 0.05,
  };

  // 6. Trust Score (peso: 5%)
  const trustScoreRaw = (freelancer.trust_score || 0) / 5.0; // Normaliza
  const trustScore = trustScoreRaw * 0.05;
  explanation.trustScore = { value: trustScoreRaw, weight: 0.05 };

  const totalScore =
    semanticScore +
    skillScore +
    seniorityScore +
    rateScore +
    availabilityScore +
    trustScore;

  return { score: totalScore, explanation };
}
