// HiMe OS MQTT IoT Telemetry Connection (Stub)

export type MQTTStatus = "connected" | "disconnected" | "connecting"

export class MQTTService {
  private status: MQTTStatus = "disconnected"
  private subscribers: Map<string, Array<(payload: any) => void>> = new Map()

  constructor() {
    this.status = "connecting"
    setTimeout(() => {
      this.status = "connected"
    }, 1500)
  }

  getConnectionStatus(): MQTTStatus {
    return this.status
  }

  subscribe(topic: string, callback: (payload: any) => void) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, [])
    }
    this.subscribers.get(topic)?.push(callback)
    
    return () => {
      const list = this.subscribers.get(topic) || []
      this.subscribers.set(
        topic,
        list.filter((cb) => cb !== callback)
      )
    }
  }

  publish(topic: string, message: any) {
    // Simulated publish to broker
    const list = this.subscribers.get(topic) || []
    list.forEach((callback) => callback(message))
  }
}
