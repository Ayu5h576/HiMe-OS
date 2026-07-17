// HiMe OS Base API Fetch Wrapper (Stub)

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = "/api/v1") {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`HTTP API error: status ${response.status}`)
    }
    return response.json() as Promise<T>
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error(`HTTP API error: status ${response.status}`)
    }
    return response.json() as Promise<T>
  }
}

export const api = new ApiClient()
