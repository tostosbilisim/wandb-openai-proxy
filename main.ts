import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { handleModelsRequest, handleChatCompletionsRequest } from "./src/handlers.ts";
import {
  addCorsHeaders,
  validateAuth,
  validateAdvancedAuth,
  methodNotAllowed,
  notFound,
  internalError,
  createOptionsResponse
} from "./src/utils.ts";

const PORT = Deno.env.get("PORT") || 8000;
const WANDB_API_KEY = Deno.env.get("WANDB_API_KEY");

/**
 * Hangi API key'in kullanılacağını belirler
 * @param authHeader İstemciden gelen auth header
 * @param useInternalKey Internal key kullanılıp kullanılmayacağı
 * @returns Kullanılacak API key
 */
function selectApiKey(authHeader: string | null, useInternalKey: boolean): string {
  if (useInternalKey) {
    // Internal kullanım için WANDB_API_KEY kullan
    return WANDB_API_KEY || "";
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Client'tan gelen key'i kullan
    return authHeader.slice(7);
  }

  // Fallback olarak WANDB_API_KEY
  return WANDB_API_KEY || "";
}

export async function handler(request: Request): Promise<Response> {
  try {
    // 处理预检请求
    if (request.method === "OPTIONS") {
      return createOptionsResponse();
    }

    // 处理基本HTTP方法限制
    if (request.method !== "GET" && request.method !== "POST") {
      return addCorsHeaders(methodNotAllowed());
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // 验证授权
    let authHeader = request.headers.get("Authorization");
    let useInternalKey = false;

    // Gelişmiş authentication kontrolü
    const validatedToken = validateAdvancedAuth(authHeader);

    if (!validatedToken) {
      // Eğer APIKEYS değişkeni varsa ve token geçersizse hata döndür
      const apiKeys = Deno.env.get("APIKEYS");
      if (apiKeys) {
        return addCorsHeaders(
          new Response(JSON.stringify({
            error: {
              message: "Invalid API key. Please provide a valid key from APIKEYS.",
              type: "invalid_request_error"
            }
          }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          })
        );
      }

      // APIKEYS yoksa ve auth header yoksa, internal WANDB_API_KEY kullan
      if (!authHeader && WANDB_API_KEY) {
        authHeader = `Bearer ${WANDB_API_KEY}`;
        useInternalKey = true;
      } else {
        return addCorsHeaders(
          new Response(JSON.stringify({
            error: {
              message: "Missing or invalid Authorization header. Use Bearer token.",
              type: "invalid_request_error"
            }
          }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          })
        );
      }
    } else {
      // Geçerli token varsa kullan
      authHeader = `Bearer ${validatedToken}`;
    }

    // API key seçimini yap
    const selectedApiKey = selectApiKey(authHeader, useInternalKey);
    const wandbAuthHeader = `Bearer ${selectedApiKey}`;

    // 路由分发
    if (pathname === "/v1/models" && request.method === "GET") {
      return handleModelsRequest(wandbAuthHeader, request).then(addCorsHeaders);
    } else if (pathname === "/v1/chat/completions" && request.method === "POST") {
      return handleChatCompletionsRequest(wandbAuthHeader, request).then(addCorsHeaders);
    } else {
      return addCorsHeaders(notFound());
    }

  } catch (error) {
    console.error("Server error:", error);
    return addCorsHeaders(internalError(error));
  }
}

// Deno Deploy适配
if (import.meta.main) {
  console.log(`Server running on http://localhost:${PORT}`);
  
  if (!WANDB_API_KEY) {
    console.warn(`⚠️  WARNING: WANDB_API_KEY environment variable is not set.`);
    console.warn(`   You must provide Authorization header with requests.`);
  } else {
    console.log(`✅ Using WANDB_API_KEY from environment`);
  }

  serve(handler, { 
    port: typeof PORT === "string" ? parseInt(PORT) : PORT,
    onListen: ({ port }) => {
      console.log(`🚀 Deno server listening on port ${port}`);
    }
  });
}

// Deno Deploy入口点
export default handler;