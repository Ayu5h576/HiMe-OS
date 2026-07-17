// HiMe OS AI Core Service Interface (Stub)

export interface AIServiceResponse {
  text: string
  tokensUsed: number
  latencyMs: number
}

export class AIService {
  static async prompt(message: string): Promise<AIServiceResponse> {
    // Simulated model latency
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      text: `[HiMe Core] Mock reply to: "${message}"`,
      tokensUsed: message.length + 15,
      latencyMs: 800,
    }
  }

  static async streamPrompt(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const text = `[HiMe Core] Streaming response for: "${message}"`
    const chunks = text.split(" ")
    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 150))
      onChunk(chunk + " ")
    }
  }
}
