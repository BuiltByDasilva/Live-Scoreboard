function getAllowedOrigin(req?: Request) {
  const origin = req?.headers.get("origin") || "";
  if (origin.startsWith("chrome-extension://")) return origin;
  if (origin === Deno.env.get("CHECKOUT_RETURN_URL")) return origin;
  return "*";
}

export function corsHeaders(req?: Request) {
  return {
  "Access-Control-Allow-Origin": getAllowedOrigin(req),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

export function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  return null;
}

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...init.headers,
    },
  });
}
