import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { rateLimit, MESSAGE_LIMIT_CONFIG } from "../_shared/rate-limiter.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { thread_id, text } = await req.json();

    // Aplicar Rate Limit por thread
    const { limited } = await rateLimit(
      supabase,
      `message_thread_${thread_id}_user_${user.id}`,
      MESSAGE_LIMIT_CONFIG
    );
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Limite de mensagens por minuto atingido." }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Inserir a mensagem
    const { data, error } = await supabase
      .from("messages")
      .insert({
        thread_id,
        text,
        sender_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Realtime broadcast (opcional, se o cliente não estiver inscrito)
    // await supabase.channel(`chat_${thread_id}`).send(...)

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
