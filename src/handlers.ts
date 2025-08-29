import {
  OpenAIChatCompletionRequest,
  OpenAICompletionResponse,
  WandBCompletionResponse,
  WandBStreamResponse,
  ModelListResponse
} from "./types.ts";
import {
  transformNonStreamResponse,
  transformStreamChunk,
  transformModelList,
  buildWandBRequest
} from "./transformers.ts";
import { CONFIG } from "../config.ts";

export async function handleModelsRequest(
  authHeader: string,
  request: Request
): Promise<Response> {
  try {
    const resp = await fetch(`${CONFIG.wandbBaseUrl}/v1/models`, {
      headers: {
        "Authorization": authHeader,
        "User-Agent": "Deno-WandB-OpenAI-Proxy/1.0"
      }
    });

    if (!resp.ok) {
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers
      });
    }

    const wandbModels = await resp.json();
    const standardized = transformModelList(wandbModels.data || []);

    return new Response(JSON.stringify(standardized), {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}

export async function handleChatCompletionsRequest(
  authHeader: string,
  request: Request
): Promise<Response> {
  const contentType = request.headers.get("Content-Type");
  if (!contentType || !contentType.includes("application/json")) {
    return createErrorResponse(
      "Unsupported Media Type, expected application/json",
      415
    );
  }

  let originalRequestBody;
  try {
    originalRequestBody = await request.json();
  } catch (e) {
    return createErrorResponse("Invalid JSON", 400);
  }

  if (!originalRequestBody.model) {
    return createErrorResponse("Missing required field: model", 400);
  }

  if (!Array.isArray(originalRequestBody.messages) && !originalRequestBody.prompt) {
    return createErrorResponse("Missing messages or prompt field", 400);
  }

  const wandbRequestBody = buildWandBRequest(originalRequestBody);

  if (originalRequestBody.stream) {
    return handleStreamRequest(wandbRequestBody, authHeader);
  }

  return handleNonStreamRequest(wandbRequestBody, authHeader, originalRequestBody.model);
}

async function handleNonStreamRequest(
  wandbRequestBody: any,
  authHeader: string,
  originalModel: string
): Promise<Response> {
  try {
    const resp = await fetch(`${CONFIG.wandbBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "User-Agent": "Deno-WandB-OpenAI-Proxy/1.0"
      },
      body: JSON.stringify(wandbRequestBody)
    });

    if (!resp.ok) {
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers
      });
    }

    const wandbResponse = await resp.json() as WandBCompletionResponse;
    const standardized = transformNonStreamResponse(wandbResponse, originalModel);

    return new Response(JSON.stringify(standardized), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}

async function handleStreamRequest(
  wandbRequestBody: any,
  authHeader: string
): Promise<Response> {
  try {
    const upstreamResponse = await fetch(`${CONFIG.wandbBaseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "User-Agent": "Deno-WandB-OpenAI-Proxy/1.0"
      },
      body: JSON.stringify(wandbRequestBody)
    });

    if (!upstreamResponse.ok) {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: upstreamResponse.headers
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          const reader = upstreamResponse.body!.getReader();
          let buffer = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.trim() === "") continue;
                
                if (line.trim() === "data: [DONE]") {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  continue;
                }

                if (line.startsWith("data:")) {
                  try {
                    const raw = JSON.parse(line.slice(5));
                    const std = transformStreamChunk(raw, wandbRequestBody.model);
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify(std)}\n\n`)
                    );
                  } catch (e) {
                    console.warn("Parse stream error:", e);
                    continue;
                  }
                } else {
                  controller.enqueue(encoder.encode(line + "\n"));
                }
              }
            }

            if (buffer.includes("[DONE]")) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            }
          } catch (err) {
            console.error("Stream transform error:", err);
          } finally {
            controller.close();
            reader.releaseLock();
          }
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no"
        }
      }
    );
  } catch (error) {
    return createErrorResponse(error, 500);
  }
}

function createErrorResponse(error: unknown, status: number): Response {
  const message = error instanceof Error ? error.message : String(error);
  return new Response(
    JSON.stringify({ 
      error: { 
        message, 
        type: "api_error" 
      } 
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}