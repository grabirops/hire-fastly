const EMBEDDING_DIMENSION = 768;

/**
 * Generates a mock embedding for a given text.
 * In a real-world scenario, this would call an external embedding service (e.g., OpenAI, Cohere, or a self-hosted model).
 * @param text The input text to generate an embedding for.
 * @returns A promise that resolves to a 768-dimension vector (array of numbers).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  console.log(
    `Generating mock embedding for text (first 50 chars): "${text.substring(
      0,
      50
    )}..."`
  );

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Generate a random vector
  const vector = Array.from(
    { length: EMBEDDING_DIMENSION },
    () => Math.random() * 2 - 1 // Generate numbers between -1 and 1
  );

  return vector;
}
