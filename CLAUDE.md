# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Wandb OpenAI Proxy - a Deno-based proxy server that converts Wandb's inference API to OpenAI standard format, optimized for Deno Deploy.

## Core Architecture

- **Entry Point**: `main.ts` - HTTP server with Deno Deploy compatibility
- **Route Handlers**: `src/handlers.ts` - OpenAI-compatible endpoints for `/v1/models` and `/v1/chat/completions`
- **Type System**: `src/types.ts` - Shared TypeScript interfaces for OpenAI and Wandb API formats
- **Transform Functions**: `src/transformers.ts` - Data transformation between OpenAI and Wandb formats
- **Utility Functions**: `src/utils.ts` - CORS, error handling, and HTTP helper functions
- **Configuration**: `config.ts` - Centralized config containing Wandb API base URL and CORS settings

## API Endpoints

- `GET /v1/models` - List available models (proxy to Wandb)
- `POST /v1/chat/completions` - Chat completions (supporting both streaming and non-streaming)
- `OPTIONS` - CORS preflight responses

## Development Commands

```bash
# Start development server (auto-reload)
deno task dev

# Start production server
deno task start

# Run tests
deno test --allow-net --allow-env
# or
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

## Environment Variables

- `WANDB_API_KEY`: Wandb API key (optional, can also use Authorization header)
- `PORT`: Local server port (default: 8000)

## Deploy Commands

### Deno Deploy (Production)
1. Set `WANDB_API_KEY` environment variable
2. Deploy via Deno Deploy dashboard at deno.com/deploy

### Local Development
```bash
# Run with custom port
PORT=3000 deno run --allow-net --allow-env main.ts
```

## Key Components Design

### Request Flow
1. `main.ts:handler()` - Route matching and request validation
2. `handleModelsRequest()` or `handleChatCompletionsRequest()` - Business logic
3. `transformers.ts` - Format conversion from OpenAI → Wandb and back
4. Utility functions handle CORS, error responses, and validation

### Streaming vs Non-Streaming
- **Non-streaming**: Standard JSON response with full completion
- **Streaming**: Server-Sent Events (SSE) with chunked responses, handled via ReadableStream transformation

## Testing Structure

- Test files are in `tests/` directory
- Integration tests use Deno's built-in testing framework
- Fixtures available for test data

## CORS Configuration

CORS is fully configured via `config.ts` with support for all origins in development mode.

## Authentication

Supports Bearer token authentication:
- Via Authorization header in requests
- Via WANDB_API_KEY environment variable (fallback)

## File Layout

```
├── main.ts           # Deno server entry point
├── config.ts         # Application configuration
├── src/
│   ├── handlers.ts   # API endpoint handlers
│   ├── transformers.ts # OpenAI-Wandb data conversion
│   ├── utils.ts      # HTTP utilities and CORS
│   └── types.ts      # TypeScript interfaces
├── tests/
│   ├── integration.test.ts # Integration tests
│   └── fixtures.ts   # Test fixtures
└── deno.json         # Deno configuration and tasks
```

## Critical Implementation Notes

### Function/Tool Calling Support

**IMPORTANT**: The upstream `api.inference.wandb.ai` API has a specific requirement for function/tool calling that this proxy must handle correctly.

- **Supported format**: The API **only** supports the modern OpenAI `tools` and `tool_choice` parameters.
- **Unsupported format**: The legacy `functions` parameter is **not supported** and will be ignored by the upstream API, resulting in a standard text response instead of a tool call.

Therefore, the transformation logic in `src/transformers.ts` must be able to detect incoming requests using the old `functions` parameter and convert them to the `tools` format before sending the request to the Wandb API. Failure to do so will result in the function calling feature not working.