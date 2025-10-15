-- Tabela para armazenar tokens de rate limiting (algoritmo "token bucket")
CREATE TABLE public.rate_limit_tokens (
    key TEXT PRIMARY KEY,
    tokens INTEGER NOT NULL,
    last_refilled_at TIMESTAMPTZ NOT NULL
);

-- Função para checar e consumir tokens
-- Baseado em: https://supabase.com/docs/guides/functions/rate-limiting
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    key TEXT,
    max_tokens INTEGER,
    refill_interval_seconds INTEGER,
    refill_amount INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    current_tokens INTEGER;
    last_refilled TIMESTAMPTZ;
    time_since_last_refill INTEGER;
    refills_to_add INTEGER;
    new_tokens INTEGER;
BEGIN
    SELECT tokens, last_refilled_at INTO current_tokens, last_refilled
    FROM public.rate_limit_tokens
    WHERE rate_limit_tokens.key = check_rate_limit.key
    FOR UPDATE;

    IF current_tokens IS NULL THEN
        -- Primeira requisição para esta chave
        current_tokens := max_tokens;
        last_refilled := NOW();
    ELSE
        -- Calcular quantos tokens devem ser adicionados desde a última recarga
        time_since_last_refill := EXTRACT(EPOCH FROM (NOW() - last_refilled));
        refills_to_add := FLOOR(time_since_last_refill / refill_interval_seconds);

        IF refills_to_add > 0 THEN
            new_tokens := LEAST(current_tokens + refills_to_add * refill_amount, max_tokens);
            current_tokens := new_tokens;
            last_refilled := last_refilled + (refills_to_add * refill_interval_seconds * INTERVAL '1 second');
        END IF;
    END IF;

    IF current_tokens > 0 THEN
        -- Consumir um token e atualizar o estado
        INSERT INTO public.rate_limit_tokens (key, tokens, last_refilled_at)
        VALUES (check_rate_limit.key, current_tokens - 1, last_refilled)
        ON CONFLICT (key)
        DO UPDATE SET tokens = current_tokens - 1, last_refilled_at = last_refilled;
        
        RETURN current_tokens - 1; -- Retorna os tokens restantes
    ELSE
        RETURN -1; -- Indica que o limite foi excedido
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
