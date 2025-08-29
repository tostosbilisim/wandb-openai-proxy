import { CONFIG } from "../config.ts";

export function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  
  newHeaders.set("Access-Control-Allow-Origin", CONFIG.cors.origins[0]);
  newHeaders.set("Access-Control-Allow-Methods", CONFIG.cors.methods.join(", "));
  newHeaders.set("Access-Control-Allow-Headers", CONFIG.cors.headers.join(", "));
  
  if (CONFIG.cors.origins[0] !== "*") {
    newHeaders.set("Vary", "Origin");
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

export function validateAuth(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  return token;
}

/**
 * Gelişmiş authentication kontrolü
 * WANDB_API_KEY veya APIKEYS değişkenlerinden gelen key'leri kontrol eder
 * @param authHeader Authorization header
 * @returns Geçerli ise token, değilse null
 */
export function validateAdvancedAuth(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);

  // Eğer APIKEYS değişkeni varsa, buradan kontrol et
  const allowedApiKeys = parseApiKeys();
  if (allowedApiKeys.length > 0) {
    return allowedApiKeys.includes(token) ? token : null;
  }

  // APIKEYS yoksa, gelen token'ı doğrudan döndür (WANDB_API_KEY ile kullanılacak)
  return token;
}

export function createOptionsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": CONFIG.cors.origins[0],
      "Access-Control-Allow-Methods": CONFIG.cors.methods.join(", "),
      "Access-Control-Allow-Headers": CONFIG.cors.headers.join(", ")
    }
  });
}

export function methodNotAllowed(): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      "Allow": "GET, POST, OPTIONS"
    }
  });
}

export function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

export function internalError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return new Response(
    JSON.stringify({ error: { message, type: "server_error" } }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

/**
 * APIKEYS environment variable'ından API key'lerini parse eder
 * Virgüllerle ayrılmış key'leri döndürür
 */
export function parseApiKeys(): string[] {
  const apiKeysEnv = Deno.env.get("APIKEYS");
  if (!apiKeysEnv) {
    return [];
  }

  return apiKeysEnv.split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);
}

/**
 * Verilen API key'in geçerli olup olmadığını kontrol eder
 * @param apiKey Kontrol edilecek API key
 * @returns Geçerli ise true, değilse false
 */
export function isValidApiKey(apiKey: string): boolean {
  const allowedKeys = parseApiKeys();
  return allowedKeys.includes(apiKey);
}