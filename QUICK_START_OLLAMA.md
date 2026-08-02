# HiMe OS Ollama - Quick Start Guide

## 1. Prerequisites

### Install Ollama
```bash
# Download from: https://ollama.ai
# Or use package manager:

# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Pull Models
```bash
# Popular models for HiMe OS
ollama pull llama3.1    # Recommended (8B, 4.7GB)
ollama pull mistral     # Fast (7B, 4.1GB)
ollama pull qwen2.5     # Efficient (7B, 4.2GB)
ollama pull phi3        # Small (3.8B, 2.3GB)

# List installed models
ollama list
```

### Start Ollama Server
```bash
# Default port: 11434
ollama serve

# Custom port (if needed)
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

## 2. Configure HiMe OS

### Environment Variables (.env)
```bash
# Make Ollama the default AI provider
AI_PROVIDER=ollama

# Ollama server connection
OLLAMA_HOST=http://localhost:11434

# Enable Ollama (default is true)
OLLAMA_ENABLED=true

# Default model
OLLAMA_MODEL=llama3.1

# Request timeout (milliseconds)
OLLAMA_TIMEOUT=120000
```

### Verify Configuration
```bash
# Check Ollama connectivity
curl http://localhost:11434/api/tags

# Should return available models
# {"models": [{"name": "llama3.1:latest"}, ...]}
```

## 3. Using Ollama in HiMe OS

### Start Backend
```bash
cd backend
npm install
npm run dev

# Or use Docker
docker run -d -p 4000:4000 hime-os-backend
```

### Start Frontend
```bash
cd ../frontend
npm install
npm run dev

# Visit http://localhost:5173
```

### Use in AI Chat

**Option 1: Frontend UI**
1. Open http://localhost:5173
2. Go to AI Assistant
3. Select "Ollama" from provider dropdown
4. Select model (llama3.1, mistral, etc.)
5. Chat normally

**Option 2: API**
```bash
# Get auth token (or use existing)
TOKEN=$(curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User",
    "email": "user@example.com",
    "password": "Password123!"
  }' | jq -r '.accessToken')

# Chat with Ollama
curl -X POST http://localhost:4000/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is HiMe OS?",
    "provider": "ollama",
    "model": "llama3.1"
  }'

# Response
# {
#   "success": true,
#   "data": {
#     "content": "HiMe OS is a personal AI operating system...",
#     "provider": "ollama",
#     "model": "llama3.1",
#     "tokensUsed": 245
#   }
# }
```

## 4. API Endpoints

### Chat (Works with any provider)
```
POST /ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Your message here",
  "provider": "ollama",         // Optional, uses default if omitted
  "model": "llama3.1",          // Optional, uses active model if omitted
  "conversationId": "conv-123"  // Optional, persists to conversation
}
```

### Check Ollama Status
```
GET /ai/providers/ollama/status
Authorization: Bearer <token>

Response:
{
  "reachable": true,
  "status": "HEALTHY",
  "version": "0.3.14",
  "activeModel": "llama3.1",
  "installedModelsCount": 4,
  "latencyMs": 12,
  "memoryUsageBytes": 8500000000
}
```

### List Available Models
```
GET /ai/providers/ollama/models
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "name": "llama3.1:latest",
      "size": 4700000000,
      "modifiedAt": "2026-07-30T12:00:00Z"
    },
    ...
  ]
}
```

### Switch Active Model
```
POST /ai/providers/ollama/model
Authorization: Bearer <token>
Content-Type: application/json

{ "model": "mistral" }

Response:
{ "activeModel": "mistral" }
```

### List All Providers
```
GET /ai/providers
Authorization: Bearer <token>

Response:
{
  "data": [
    {
      "name": "ollama",
      "enabled": true,
      "reachable": true,
      "activeModel": "llama3.1",
      "availableModels": ["llama3.1", "mistral", "qwen", "phi3"]
    },
    // ... other providers (openai, gemini, claude)
  ]
}
```

## 5. Testing

### Run All Tests
```bash
cd backend
npm test

# Should show 366+ tests passing
```

### Run Ollama-Specific Tests
```bash
npm test -- ollama.test.ts

# Output:
# ✓ tests/ollama.test.ts (17 tests) 44ms
# Test Files 1 passed (1)
# Tests 17 passed (17)
```

### Manual Testing
```bash
# 1. Verify Ollama is running
curl http://localhost:11434/api/tags

# 2. Verify HiMe OS backend is running
curl http://localhost:4000/health

# 3. Register a user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@hime.local","password":"Test123!"}'

# 4. Get token from response
TOKEN="..." # Copy from response

# 5. Test Ollama status
curl http://localhost:4000/ai/providers/ollama/status \
  -H "Authorization: Bearer $TOKEN"

# 6. Send a chat message
curl -X POST http://localhost:4000/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello!","provider":"ollama"}'
```

## 6. Troubleshooting

### "Connection refused" Error

```bash
# Check if Ollama is running
ollama serve

# If port is different, update .env
OLLAMA_HOST=http://localhost:11435  # or your port
```

### "Model not found"

```bash
# Check available models
ollama list

# Pull missing model
ollama pull llama3.1

# Verify in HiMe OS
curl http://localhost:4000/ai/providers/ollama/models \
  -H "Authorization: Bearer $TOKEN"
```

### "Memory error" in Ollama

```bash
# Check system RAM
free -h  # Linux
wmic OS get TotalVisibleMemorySize  # Windows

# Use smaller model
ollama pull phi3:mini     # Only 2.3GB
ollama pull mistral       # 4.1GB
ollama pull llama3.1:8b   # 4.7GB
```

### High Latency (>1000ms)

```bash
# 1. Check system load
top  # Linux
tasklist  # Windows

# 2. Increase timeout in .env
OLLAMA_TIMEOUT=180000  # 3 minutes

# 3. Switch to smaller model for faster response
ollama pull mistral    # Faster than llama3.1
ollama pull phi3       # Even faster
```

## 7. Model Selection Guide

### For Development (Fastest)
```bash
ollama pull mistral    # 4.1GB, fast inference
ollama pull phi3       # 2.3GB, very fast
```

### For Best Quality
```bash
ollama pull llama3.1   # 4.7GB, good quality
ollama pull llama3.2   # 8B+ parameter model
```

### For Function Calling
```bash
ollama pull mistral    # Excellent tool calling
ollama pull llama3.1   # Good tool calling
```

### For Low-Resource Systems
```bash
ollama pull phi3:mini  # 2.3GB
ollama pull neural-chat:7b  # Lightweight
```

## 8. Features Demonstrated

### Basic Chat
```typescript
const response = await provider.generateResponse({
  prompt: "What is HiMe OS?",
  model: "llama3.1"
});
// Returns: NormalizedAIResponse with message and token count
```

### Streaming Chat
```typescript
const stream = await provider.streamResponse({
  prompt: "Write a story about HiMe OS"
});

for await (const chunk of stream) {
  console.log(chunk);  // Receive tokens as they stream
}
```

### Model Discovery
```typescript
const models = await provider.listModels();
// ["llama3.1", "mistral", "qwen", "phi3"]

const detailed = await provider.listModelsDetailed();
// Includes size, digest, model details
```

### Tool Calling
```typescript
// Tools automatically included from ToolRegistry
const response = await provider.generateResponse({
  prompt: "Launch notepad and check the weather"
});

// Model suggests using available tools
// ToolExecutor handles actual execution
```

### Memory/RAG Integration
```typescript
// ContextBuilder automatically:
// 1. Retrieves relevant memories based on message
// 2. Injects them into the prompt
// 3. Ollama uses the memory context

const response = await provider.generateResponse({
  prompt: "What did I ask before?",
  normalizedPrompt: contextWithMemories
});
```

## 9. Performance Metrics

### Expected Latency
- **First response:** 50-500ms (depends on model size)
- **Streaming first token:** 100-300ms  
- **Health check:** <3 seconds
- **Model discovery:** <5 seconds

### Token Efficiency
```
Typical chat:
- Prompt: 50-200 tokens
- Response: 100-500 tokens
- Total: 150-700 tokens per request

System overhead:
- Memory context: +50-100 tokens
- Tool definitions: +100-200 tokens
- Total overhead: ~150-300 tokens
```

## 10. Switching Providers

### Change Default Provider in .env
```bash
# OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...

# Claude
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...

# Ollama (local)
AI_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
```

### Switch at Runtime via API
```bash
# Use Ollama for this request
curl -X POST http://localhost:4000/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Hi","provider":"ollama"}'

# Use OpenAI for another request
curl -X POST http://localhost:4000/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt":"Hi","provider":"openai"}'
```

---

## Resources

- **Ollama Website:** https://ollama.ai
- **Model Library:** https://ollama.ai/library
- **Documentation:** See `OLLAMA_INTEGRATION_REPORT.md`
- **Implementation:** See `IMPLEMENTATION_SUMMARY.md`
- **Tests:** `backend/tests/ollama.test.ts`

## Support

Need help?

1. Check **Troubleshooting** section above
2. Review the detailed **OLLAMA_INTEGRATION_REPORT.md**
3. Run tests: `npm test -- ollama.test.ts`
4. Check Ollama status: `curl http://localhost:11434/api/tags`
5. Check HiMe OS backend: `curl http://localhost:4000/health`

---

**Status:** ✅ Production Ready  
**Last Updated:** August 2, 2026  
**Test Results:** 17/17 Ollama tests passing
