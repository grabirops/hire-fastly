import posthog from "posthog-js";

// A chave da API do PostHog viria de variáveis de ambiente
const POSTHOG_API_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const IS_PROD = import.meta.env.PROD;

if (typeof window !== "undefined" && IS_PROD && POSTHOG_API_KEY) {
  posthog.init(POSTHOG_API_KEY, {
    api_host: "https://app.posthog.com",
    // Ativação de features extras, como autocaptura, pode ser configurada aqui
    autocapture: false,
    capture_pageview: false, // Pageviews serão capturadas manualmente se necessário
  });
}

/**
 * Rastreia um evento customizado no PostHog.
 * @param eventName O nome do evento a ser rastreado.
 * @param properties Propriedades adicionais para associar ao evento.
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (IS_PROD && posthog.is_initialized()) {
    posthog.capture(eventName, properties);
  } else {
    console.log(`[PostHog Mock Event]: ${eventName}`, properties);
  }
}

/**
 * Identifica o usuário no PostHog, associando eventos futuros a ele.
 * @param userId O ID único do usuário.
 * @param properties Propriedades do usuário (ex: nome, email, role).
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (IS_PROD && posthog.is_initialized()) {
    posthog.identify(userId, properties);
  } else {
    console.log(`[PostHog Mock Identify]: ${userId}`, properties);
  }
}
