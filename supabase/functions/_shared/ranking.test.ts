import { describe, it, expect } from "vitest";
import { calculateRankScore } from "./ranking";

describe("calculateRankScore", () => {
  it("should return a score of 1.0 for a perfect match", () => {
    const job = {
      skills: ["React", "Node.js"],
      seniority: "SENIOR",
    };
    const freelancer = {
      trust_score: 5.0,
      freelancer_profiles: [
        {
          skills: ["React", "Node.js"],
          seniority: "SENIOR",
          availability: "true",
        },
      ],
    };
    const semanticSimilarity = 1.0;

    const { score } = calculateRankScore(freelancer, job, semanticSimilarity);
    // 0.40 (semantic) + 0.25 (skills) + 0.15 (seniority) + 0.10 (rate fit, placeholder=0) + 0.05 (availability) + 0.05 (trust)
    const expectedScore = 0.4 + 0.25 + 0.15 + 0 + 0.05 + 0.05;
    expect(score).toBeCloseTo(expectedScore); // 0.90
  });

  it("should return a lower score for a partial match", () => {
    const job = {
      skills: ["React", "Node.js", "PostgreSQL"],
      seniority: "SENIOR",
    };
    const freelancer = {
      trust_score: 3.0,
      freelancer_profiles: [
        {
          skills: ["React"],
          seniority: "PLENO", // Mismatch
          availability: null,
        },
      ],
    };
    const semanticSimilarity = 0.6;

    const { score } = calculateRankScore(freelancer, job, semanticSimilarity);
    // semantic: 0.6 * 0.40 = 0.24
    // skills: (1/3) * 0.25 = 0.0833
    // seniority: 0
    // rate fit: 0
    // availability: 0
    // trust: (3/5) * 0.05 = 0.03
    const expectedScore = 0.24 + (1 / 3) * 0.25 + 0 + 0 + 0 + (3 / 5) * 0.05;
    expect(score).toBeCloseTo(expectedScore);
  });
});
