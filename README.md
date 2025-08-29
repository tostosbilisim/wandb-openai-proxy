<div align="center">

# 🔗 Wandb OpenAI Proxy / Wandb OpenAI 代理服务

### 将 Wandb 推理 API 无缝转换为 OpenAI 标准格式的 Deno 代理服务器
### Seamless conversion between Wandb inference API and OpenAI standard format via Deno proxy

[![Deno](https://img.shields.io/badge/Deno-1.43+-blue.svg)](https://deno.land/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Deploy](https://img.shields.io/badge/deploy%20to-deno-brightgreen.svg?logo=deno)](https://dash.deno.com/new?url=https://github.com/wandb/wandb-openai-proxy)

[![Deploy to Deno Deploy](https://button.deno.dev/deploy.svg)](https://dash.deno.com/new?url=https://github.com/wandb/wandb-openai-proxy)

</div>

## 📑 语言选择 / Language Selection
- [🇨🇳 中文版](#中文版)
- [🇺🇸 English](#english)

---

<a name="中文版"></a>
# 🇨🇳 中文版

## 🌟 功能特性

- **🔄 100% OpenAI API 兼容**: 完全兼容 OpenAI Chat Completion API 格式
- **⚡ 双模式响应**: 同时支持流式 (`stream=true`) 和非流式响应
- **📋 模型管理**: 获取所有可用 Wandb 模型列表
- **🌍 跨域支持**: 内置 CORS 支持，支持所有来源
- **🔐 灵活认证**: 支持 Bearer Token 和环境变量认证
- **⚙️ Deno Deploy 原生支持**: 专为 Deno Deploy 优化的云端部署
- **🧪 TypeScript**: 使用 TypeScript 构建，提供完整类型支持

## 🚀 快速开始

### 方法一：一键部署到 Deno Deploy (推荐)

[![Deploy to Deno Deploy](https://button.deno.dev/deploy.svg)](https://dash.deno.com/new?url=https://github.com/wandb/wandb-openai-proxy)

点击上方按钮，立即部署您的专属代理服务！

### 方法二：本地开发

#### 环境准备
```bash
# 克隆项目
git clone <repository-url>
cd wandb-openai-proxy

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Wandb API Key
echo "WANDB_API_KEY=your_wandb_api_key_here" >> .env
```

#### 启动服务
```bash
# 开发模式（热重载）
deno task dev

# 生产模式
deno task start

# 或直接运行
deno run --allow-net --allow-env main.ts
```

#### 运行测试
```bash
# 运行所有测试
deno task test

# 格式化代码
deno task fmt

# 代码检查
deno task lint
```

## 📡 API 接口文档

### 1. 获取可用模型列表

```bash
# 请求
curl https://your-domain.deno.dev/v1/models \
  -H "Authorization: Bearer your_wandb_api_key"

# 响应示例
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1686935002,
      "owned_by": "wandb"
    },
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1686935002,
      "owned_by": "wandb"
    }
  ]
}
```

### 2. 对话完成 - 非流式响应

```bash
# 请求
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "解释一下机器学习中的过拟合问题"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }'

# 响应示例
{
  "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "过拟合是机器学习中的一个重要概念..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 12,
    "total_tokens": 31
  }
}
```

### 3. 对话完成 - 流式响应

```bash
# 请求
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ],
    "max_tokens": 100,
    "stream": true
  }'

# 响应是 Server-Sent Events (SSE) 格式的流数据
data: {"choices":[{"delta":{"content":"你好！我是"},"index":0}],...}
```

### 4. 函数调用支持

支持 OpenAI 现代的 `tools` 和 `tool_choice` 参数，推荐使用方式来启用函数调用：

```bash
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "北京今天的天气怎么样？"}
    ],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "获取指定城市的天气信息",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string", "description": "城市名称"}
          },
          "required": ["city"]
        }
      }
    }],
    "tool_choice": "auto"
  }'
```

## ⚙️ 配置选项

### 环境变量配置

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `WANDB_API_KEY` | ✅ | - | Wandb API密钥，用于认证 |
| `PORT` | ❌ | 8000 | 本地开发服务器端口 |

### 认证方式

支持两种认证方式：

1. **请求头认证**（推荐）：
   ```
   Authorization: Bearer your_wandb_api_key
   ```

2. **环境变量认证**：
   - 在部署时设置 `WANDB_API_KEY` 环境变量
   - 请求时可省略 Authorization 头

## 🏗️ 项目结构

```
wandb-openai-proxy/
├── main.ts              # 入口文件
├── config.ts            # 配置文件
├── src/
│   ├── handlers.ts      # 路由处理器
│   ├── transformers.ts  # 数据转换器
│   ├── types.ts         # TypeScript类型定义
│   └── utils.ts         # 工具函数
├── tests/
│   ├── fixtures.ts      # 测试数据
│   └── integration.test.ts # 集成测试
├── deno.json            # Deno配置
├── .env.example         # 环境变量模板
└── README.md            # 本文档
```

## 🚀 Deno Deploy 终极部署指南

### 方案一：GitHub 集成部署 (推荐)

1. **Fork 本仓库**
   - 点击右上角的 "Fork" 按钮
   - 将项目 Fork 到你的 GitHub 账户

2. **一键部署**
   - 点击下方按钮直接部署你的 Fork：
   [![Deploy to Deno Deploy](https://button.deno.dev/deploy.svg)](https://dash.deno.com/new?url=https://github.com/YOUR_USERNAME/wandb-openai-proxy)

3. **配置环境变量**
   - 部署后在 Deno Deploy 控制台设置：
     - `WANDB_API_KEY`: 你的 Wandb API 密钥

### 方案二：手动部署

#### 步骤 1: 准备代码

如果已经 Fork 了项目，可以跳过

#### 步骤 2: 访问 Deno Deploy

访问：https://dash.deno.com

#### 步骤 3: 新建项目

1. 点击 "New Project"
2. 选择 "从 GitHub 导入"
3. 选择你的仓库
4. 选择主分支(main/master)

#### 步骤 4: 配置环境变量

1. 在项目页面点击 "Settings"
2. 选择 "Environment Variables"
3. 添加：
   - 名称：`WANDB_API_KEY`
   - 值：你的 Wandb API 密钥

#### 步骤 5: 测试部署

部署完成后，你会得到一个类似：`https://your-project-xxxxx.deno.dev` 的域名

访问测试：
```bash
curl https://your-project-xxxxx.deno.dev/v1/models \
  -H "Authorization: Bearer $(echo $WANDB_API_KEY)"
```

### 方案三：命令行部署

```bash
# 使用 Deno CLI 部署（需安装 deno）
deno run -A https://deno.land/x/deployctl/main.ts deploy --project=wandb-proxy main.ts

# 配置环境变量（首次部署时需要）
deno deploy --project=wandb-proxy --env="WANDB_API_KEY=sk-xxx" main.ts
```

### 📱 自定义域名

在 Deno Deploy 控制台：
1. 进入项目设置
2. 选择 "Domains"
3. 可绑定自定义域名或使用 *.deno.dev 子域名

## 🔧 开发指南

### 开发环境设置
```bash
# 安装 Deno (如果未安装)
curl -fsSL https://deno.land/install.sh | sh

# 克隆并进入项目
git clone <your-fork-url>
cd wandb-openai-proxy

# 安装依赖（Deno 自动处理）
# 无需手动安装！
```

### 代码调试
```bash
# 开发模式（带热重载）
deno task dev

# 运行测试
deno task test

# 代码检查
deno task lint

# 格式化
deno task fmt
```

### 添加新功能
1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📞 支持与贡献

欢迎通过以下方式参与：
- 🐛 **问题反馈**: 创建 Issue
- 💡 **功能建议**: 讨论区提出想法
- 🔧 **代码贡献**: 提交 Pull Request
- 📖 **文档改进**: 完善 README

---

<a name="english"></a>
# 🇺🇸 English

## 🌟 Features

- **🔄 100% OpenAI API Compatible**: Fully compatible with OpenAI Chat Completion API
- **⚡ Dual Response Modes**: Supports both streaming (`stream=true`) and non-streaming responses
- **📋 Model Management**: Get complete list of available Wandb models
- **🌍 Cross-Origin Support**: Built-in CORS headers for all origins
- **🔐 Flexible Authentication**: Supports Bearer Token and environment variable auth
- **⚙️ Native Deno Deploy**: Optimized for cloud deployment on Deno Deploy
- **🧪 TypeScript**: Built with TypeScript for complete type support

## 🚀 Quick Start

### Option 1: One-Click Deploy to Deno Deploy (Recommended)

[![Deploy to Deno Deploy](https://button.deno.dev/deploy.svg)](https://dash.deno.com/new?url=https://github.com/wandb/wandb-openai-proxy)

Click the button above to instantly deploy your own proxy service!

### Option 2: Local Development

#### Prerequisites
```bash
# Clone the repository
git clone <repository-url>
cd wandb-openai-proxy

# Setup environment variables
cp .env.example .env
# Edit .env file with your Wandb API Key
echo "WANDB_API_KEY=your_wandb_api_key_here" >> .env
```

#### Start Service
```bash
# Development mode (hot reload)
deno task dev

# Production mode
deno task start

# Or run directly
deno run --allow-net --allow-env main.ts
```

#### Run Tests
```bash
# Run all tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
```

## 📡 API Documentation

### 1. Get Available Models

```bash
# Request
curl https://your-domain.deno.dev/v1/models \
  -H "Authorization: Bearer your_wandb_api_key"

# Response Example
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1686935002,
      "owned_by": "wandb"
    },
    {
      "id": "gpt-3.5-turbo",
      "object": "model",
      "created": 1686935002,
      "owned_by": "wandb"
    }
  ]
}
```

### 2. Chat Completion - Non-streaming

```bash
# Request
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Explain machine learning overfitting"}
    ],
    "max_tokens": 500,
    "temperature": 0.7
  }'

# Response Example
{
  "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Overfitting is an important concept in machine learning..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 19,
    "completion_tokens": 12,
    "total_tokens": 31
  }
}
```

### 3. Chat Completion - Streaming

```bash
# Request
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, introduce yourself"}
    ],
    "max_tokens": 100,
    "stream": true
  }'

# Response: Server-Sent Events (SSE) streaming
data: {"choices":[{"delta":{"content":"Hello! I'm"},"index":0}],...}
```

### 4. Function Calling Support

Supports modern OpenAI `tools` and `tool_choice` parameters:

```bash
curl https://your-domain.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_wandb_api_key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "What\'s the weather like in Beijing today?"}
    ],
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather information for a specified city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string", "description": "City name"}
          },
          "required": ["city"]
        }
      }
    }],
    "tool_choice": "auto"
  }'
```

## ⚙️ Configuration Options

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `WANDB_API_KEY` | ✅ | - | Your Wandb API key for authentication |
| `PORT` | ❌ | 8000 | Local development server port |

### Authentication Methods

1. **Request Header (Recommended)**:
   ```
   Authorization: Bearer your_wandb_api_key
   ```

2. **Environment Variable**:
   - Set `WANDB_API_KEY` in deployment environment variables
   - Omit Authorization header in requests

## 🏗️ Project Structure

```
wandb-openai-proxy/
├── main.ts              # Entry point
├── config.ts            # Configuration
├── src/
│   ├── handlers.ts      # Route handlers
│   ├── transformers.ts  # Data transformers
│   ├── types.ts         # TypeScript definitions
│   └── utils.ts         # Utility functions
├── tests/
│   ├── fixtures.ts      # Test fixtures
│   └── integration.test.ts # Integration tests
├── deno.json            # Deno configuration
├── .env.example         # Environment template
└── README.md            # This documentation
```

## 🚀 Complete Deno Deploy Deployment Guide

### Option 1: GitHub Integration (Recommended)

1. **Fork this Repository**
   - Click the "Fork" button in the top-right corner
   - Fork the project to your GitHub account

2. **One-Click Deploy**
   - Click the button below to deploy your fork:
   [![Deploy to Deno Deploy](https://button.deno.dev/deploy.svg)](https://dash.deno.com/new?url=https://github.com/YOUR_USERNAME/wandb-openai-proxy)

3. **Configure Environment Variables**
   - After deployment, set variables in Deno Deploy console:
     - `WANDB_API_KEY`: Your Wandb API key

### Option 2: Manual Deployment

#### Step 1: Prepare Code

If you've already forked the project, you can skip this step

#### Step 2: Access Deno Deploy

Visit: https://dash.deno.com

#### Step 3: Create New Project

1. Click "New Project"
2. Select "Import from GitHub"
3. Choose your repository
4. Select main/master branch

#### Step 4: Configure Environment Variables

1. In project page, click "Settings"
2. Select "Environment Variables"
3. Add:
   - Name: `WANDB_API_KEY`
   - Value: Your Wandb API key

#### Step 5: Test Deployment

After deployment, you'll get a domain like: `https://your-project-xxxxx.deno.dev`

Test deployment:
```bash
curl https://your-project-xxxxx.deno.dev/v1/models \
  -H "Authorization: Bearer $(echo $WANDB_API_KEY)"
```

### Option 3: CLI Deployment

```bash
# Deploy via Deno CLI (requires deno installed)
deno run -A https://deno.land/x/deployctl/main.ts deploy --project=wandb-proxy main.ts

# Configure environment variables (on first deployment)
deno deploy --project=wandb-proxy --env="WANDB_API_KEY=sk-xxx" main.ts
```

### 📱 Custom Domain

In Deno Deploy console:
1. Go to project settings
2. Select "Domains"
3. Bind custom domain or use *.deno.dev subdomain

## 🔧 Development Guide

### Development Environment
```bash
# Install Deno (if not installed)
curl -fsSL https://deno.land/install.sh | sh

# Clone and enter project
git clone <your-fork-url>
cd wandb-openai-proxy

# Dependencies (Deno auto-handles)
# No manual installation needed!
```

### Code Debugging
```bash
# Development mode (hot reload)
deno task dev

# Run tests
deno task test

# Code linting
deno task lint

# Formatting
deno task fmt
```

### Adding New Features
1. Fork this project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support & Contributing

Welcome to contribute via:
- 🐛 **Bug Reports**: Create Issues
- 💡 **Feature Suggestions**: Propose ideas in Discussions
- 🔧 **Code Contributions**: Submit Pull Requests
- 📖 **Documentation**: Improve README

---

<div align="center">

**⭐ 给该项目点星 / ⭐ Star this project**

Made with ❤️ for the Deno community

</div>