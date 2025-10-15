import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

interface RateLimitConfig {
  maxTokens: number;
  refillIntervalSeconds: number;
  refillAmount: number;
}

/**
 * Checks if a given key has exceeded its rate limit.
 * @param supabase - The Supabase admin client.
 * @param key - A unique identifier for the action and user (e.g., `proposals_user_123`).
 * @param config - The rate limit parameters.
 * @returns {Promise<{-readonly remaining: number, readonly limited: false} | {-readonly limited: true}>}
 */
export async function rateLimit(
  supabase: SupabaseClient,
  key: string,
  config: RateLimitConfig
) {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    key: key,
    max_tokens: config.maxTokens,
    refill_interval_seconds: config.refillIntervalSeconds,
    refill_amount: config.refillAmount,
  });

  if (error) {
    console.error("Error in rate limit check:", error);
    // Em caso de falha, optamos por não aplicar o limite para não bloquear usuários legítimos
    return { limited: false, remaining: 1 };
  }

  const remainingTokens = data;

  if (remainingTokens < 0) {
    return { limited: true };
  }

  return { limited: false, remaining: remainingTokens };
}

// Exemplo de configurações
export const PROPOSAL_LIMIT_CONFIG: RateLimitConfig = {
  maxTokens: 5, // 5 propostas
  refillIntervalSeconds: 86400, // 24 horas
  refillAmount: 5,
};

export const MESSAGE_LIMIT_CONFIG: RateLimitConfig = {
  maxTokens: 10, // 10 mensagens
  refillIntervalSeconds: 60, // 1 minuto
  refillAmount: 10,
};
