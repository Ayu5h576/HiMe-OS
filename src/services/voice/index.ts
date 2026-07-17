// HiMe OS Voice Speech-to-Text and Wake Word Service (Stub)

export class VoiceService {
  private isListening = false

  getIsListening() {
    return this.isListening
  }

  startWakeWordDetection(onWakeWord: () => void) {
    this.isListening = true
    console.log("[VoiceService] Wake word listener started ('Hey HiMe' / 'HiMe OS')")
    // Simulated wake word detection
    setTimeout(() => {
      if (this.isListening) {
        onWakeWord()
      }
    }, 15000)
  }

  stopWakeWordDetection() {
    this.isListening = false
    console.log("[VoiceService] Wake word listener stopped")
  }

  speak(text: string) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      // Custom voice parameters
      utterance.pitch = 1.0
      utterance.rate = 1.05
      window.speechSynthesis.speak(utterance)
    } else {
      console.log(`[VoiceService Speech synthesis output]: "${text}"`)
    }
  }
}
