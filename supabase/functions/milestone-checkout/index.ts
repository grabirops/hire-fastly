import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { calculatePlatformFee } from "../../src/lib/fees.ts";
import { createPixCharge } from "../../src/lib/payments/provider.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { milestone_id } = await req.json();

    if (!milestone_id) {
      return new Response(
        JSON.stringify({ error: "Milestone ID is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { data: milestone, error: milestoneError } = await supabase
      .from("milestones")
      .select("*, contracts(*)")
      .eq("id", milestone_id)
      .single();

    if (milestoneError || !milestone) {
      return new Response(JSON.stringify({ error: "Milestone not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const platformFee = calculatePlatformFee(milestone.value);
    const grossValue = milestone.value + platformFee;

    const charge = await createPixCharge(grossValue);

    if (!charge.success) {
      return new Response(
        JSON.stringify({ error: "Failed to create PIX charge" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const paymentData = {
      milestone_id: milestone.id,
      gross_value: grossValue,
      platform_fee: platformFee,
      net_value: milestone.value,
      provider: "ASAAS", // Or get from config
      provider_payment_id: charge.paymentId,
      qr_code: charge.qrCode,
      status: "PENDENTE",
    };

    const { data: newPayment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment record" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    return new Response(JSON.stringify(newPayment), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
