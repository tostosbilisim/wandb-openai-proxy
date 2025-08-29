# Wandb OpenAI Proxy

将 wandb 推理 API 转换为 OpenAI 标准格式的 Deno 代理服务器，专为 Deno Deploy 优化。

## 功能特性

- ✅ **OpenAI API 兼容**: 100% 兼容 OpenAI Chat Completion API
- ✅ **流式/非流式响应**: 支持 `stream: true` 参数
- ✅ **模型列表**: 获取可用模型列表
- ✅ **Deno Deploy 部署**: 直接在 deno.dev 运行
- ✅ **跨域支持**: 内置 CORS 头
- ✅ **环境变量**: 支持 API Key 配置

## API 接口

### 获取模型列表
```bash
curl https://wansb-openai-proxy.deno.dev/v1/models \
  -H "Authorization: Bearer your_wandb_api_key"
```

### 对话完成 (非流式)
```bash
curl https://wansb-openai-proxy.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ],
    "max_tokens": 100
  }'
```

### 对话完成 (流式)
```bash
curl https://wansb-openai-proxy.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ],
    "max_tokens": 100,
    "stream": true
  }'
```

## Deno Deploy 部署

1. **准备工作**:
   ```bash
   cp .env.example .env
   # 编辑 .env 文件设置你的 wandb API key
   ```

2. **本地测试**:
   ```bash
   deno task start
   # 或
   deno run --allow-net --allow-env main.ts
   ```

3. **部署到 Deno Deploy**:
   - 访问 [deno.com/deploy](https://deno.com/deploy)
   - 导入本项目代码
   - 设置环境变量 `WANDB_API_KEY`
   - 部署完成！

## 配置

| 环境变量 | 说明 | 示例 |
|----------|------|------|
| `WANDB_API_KEY` | wandb API key | `sk-...` |
| `PORT` | 本地开发端口 | `8000` |

## 开发

```bash
# 格式化代码
deno task fmt

# 代码检查
deno task lint

# 运行测试
deno task test

# 开发模式（热重载）
deno task dev
```

## 技术架构

- **运行时**: Deno
- **部署**: Deno Deploy
- **框架**: 原生 HTTP 服务器
- **类型**: TypeScript