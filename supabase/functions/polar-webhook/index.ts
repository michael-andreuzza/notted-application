// Polar Webhook Handler for Supabase Edge Functions
// Receives purchase events from Polar and stores entitlements

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const data = JSON.parse(payload);

    console.log("Received webhook event:", data.type);

    // Handle order.paid event (and similar payment events)
    if (data.type === "order.paid" || data.type === "checkout.updated") {
      const order = data.data;
      
      // Extract email from the order
      const email = order.customer?.email || order.user?.email || order.email;
      const orderId = order.id;
      const productId = order.product?.id || order.product_id;
      const customerId = order.customer?.id || order.customer_id;
      const amount = order.amount || order.total_amount;
      const currency = order.currency || "USD";

      if (!email || !orderId) {
        console.log("Missing email or order_id, skipping");
        return new Response(JSON.stringify({ received: true, skipped: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Processing order:", { email, orderId, productId });

      // Initialize Supabase client with service role
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Insert entitlement (upsert to handle retries)
      const { error } = await supabase.from("entitlements").upsert(
        {
          email: email.toLowerCase(),
          order_id: orderId,
          product_id: productId,
          customer_id: customerId,
          amount: amount,
          currency: currency,
        },
        { onConflict: "order_id" }
      );

      if (error) {
        console.error("Error inserting entitlement:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("Entitlement stored successfully for:", email);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
