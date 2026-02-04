// Polar Webhook Handler for Supabase Edge Functions
// Receives purchase events from Polar and stores entitlements

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

// Verify Polar webhook signature (HMAC-SHA256)
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  webhookId: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  try {
    // Polar uses standard webhook signature format
    const signedContent = `${webhookId}.${timestamp}.${payload}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signedContent);
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBytes = await crypto.subtle.sign("HMAC", key, messageData);
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
    
    // Signature header format: v1,<base64signature>
    const expectedSignature = signature.split(",").find(s => s.startsWith("v1,"))?.replace("v1,", "") || signature;
    
    return computedSignature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("POLAR_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get signature headers
    const webhookId = req.headers.get("webhook-id") || "";
    const webhookTimestamp = req.headers.get("webhook-timestamp") || "";
    const webhookSignature = req.headers.get("webhook-signature") || "";

    // Read body
    const payload = await req.text();

    // Verify signature (skip in development if no signature provided)
    if (webhookSignature) {
      const isValid = await verifyWebhookSignature(
        payload,
        webhookSignature,
        webhookId,
        webhookTimestamp,
        webhookSecret
      );

      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse the webhook payload
    const event = JSON.parse(payload);
    console.log("Received Polar webhook:", event.type);

    // Handle checkout/order completed events
    // Polar sends different event types, handle the ones for successful purchase
    if (
      event.type === "checkout.created" ||
      event.type === "order.created" ||
      event.type === "subscription.created" ||
      event.type === "checkout.updated"
    ) {
      const data = event.data;
      
      // Extract customer email and order info
      // Polar payload structure may vary, handle common fields
      const email = data.customer_email || data.email || data.customer?.email;
      const orderId = data.id || data.order_id || data.checkout_id;
      const productId = data.product_id || data.product?.id;
      const customerId = data.customer_id || data.customer?.id;
      const amount = data.amount || data.total_amount;
      const currency = data.currency || "USD";

      if (!email || !orderId) {
        console.log("Missing email or order_id, skipping:", { email, orderId });
        return new Response(
          JSON.stringify({ received: true, skipped: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Initialize Supabase client with service role
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Insert entitlement (upsert to handle duplicate webhooks)
      const { error } = await supabase
        .from("entitlements")
        .upsert(
          {
            email: email.toLowerCase(),
            order_id: orderId,
            product_id: productId,
            customer_id: customerId,
            amount,
            currency,
          },
          { onConflict: "order_id" }
        );

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ error: "Database error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Entitlement created for:", email);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
