// modules/assessment/service.ts
export class AssessmentService {
  private readonly baseUrl =
    process.env.ML_SERVICE_URL ?? 'http://localhost:8000'

  async assess(audioFile: File, referenceText: string) {
    const form = new FormData()
    form.append('audio', audioFile)
    form.append('referenceText', referenceText)

    const res = await fetch(`${this.baseUrl}/assess`, {
      method: 'POST',
      body: form,
    })

    if (!res.ok) throw new Error(`ML service error: ${res.status}`)
    return res.json()
  }
}
