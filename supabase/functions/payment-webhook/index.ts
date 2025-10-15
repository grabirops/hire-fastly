import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyWebhook } from "../../src/lib/payments/provider.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const signature = req.headers.get("X-Signature") || "";
    const payload = await req.json();

    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    const { success } = await verifyWebhook(payload, signature);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const providerPaymentId = payload.paymentId; // Adjust based on provider's payload
    const event = payload.event; // e.g., 'PAYMENT_CONFIRMED'

    if (event === "PAYMENT_CONFIRMED") {
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select("*, milestones(id)")
        .eq("provider_payment_id", providerPaymentId)
        .single();

      if (paymentError || !payment) {
        return new Response(JSON.stringify({ error: "Payment not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      // Disparar evento para o PostHog (simulado)
      console.log("[PostHog Server Event]: pix_paid", {
        distinct_id: payment.milestones.contracts.company_id, // Identifica o usuário
        properties: {
          payment_id: payment.id,
          milestone_id: payment.milestones.id,
          contract_id: payment.milestones.contracts.id,
          gross_value: payment.gross_value,
        },
      });
      // posthog.capture({ event: 'pix_paid', ... }) // Chamada real

      const { error: updatePaymentError } = await supabase
        .from("payments")
        .update({
          status: "PAGO",
          paid_at: new Date().toISOString(),
          webhook_payload: payload,
        })
        .eq("id", payment.id);

      if (updatePaymentError) {
        console.error("Error updating payment status:", updatePaymentError);
        // Retry logic might be needed here
      }

      const milestone = Array.isArray(payment.milestones)
        ? payment.milestones[0]
        : payment.milestones;
      const { error: updateMilestoneError } = await supabase
        .from("milestones")
        .update({ status: "PAGO" })
        .eq("id", milestone.id);

      if (updateMilestoneError) {
        console.error("Error updating milestone status:", updateMilestoneError);
        // Retry logic might be needed here
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Unexpected error in webhook handler:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
