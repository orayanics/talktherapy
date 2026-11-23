class PracticePcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const samples = inputs[0]?.[0]
    if (samples?.length) {
      const pcm = Int16Array.from(samples, (sample) =>
        Math.round(Math.max(-1, Math.min(1, sample)) * 32767),
      )
      this.port.postMessage(pcm.buffer, [pcm.buffer])
    }
    return true
  }
}
registerProcessor('practice-pcm', PracticePcmProcessor)
