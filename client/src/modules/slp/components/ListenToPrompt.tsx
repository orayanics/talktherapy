import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'

const PROMPT_VOICE = {
  pitch: 1, // 0–2, lower to higher
  rate: 0.76, // 1 is normal speed
  preferredNames: { en: '', tl: '' } as Record<string, string>, // Exact local voice names
}

export default function ListenToPrompt({
  text,
  language,
}: {
  text: string
  language: string
}) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice>()
  useEffect(() => {
    const synth = window.speechSynthesis
    const chooseVoice = () => {
      const base = language.toLowerCase().split('-')[0]
      const filipino = base === 'tl' || base === 'fil'
      const voices = synth
        .getVoices()
        .filter(
          (item) =>
            item.localService &&
            (filipino
              ? /^(fil|tl)(-|$)/i.test(item.lang)
              : item.lang.toLowerCase().split('-')[0] === base),
        )
      const preferred = PROMPT_VOICE.preferredNames[filipino ? 'tl' : base]
      setVoice(voices.find((item) => item.name === preferred) ?? voices[0])
    }
    chooseVoice()
    synth.addEventListener('voiceschanged', chooseVoice)
    return () => {
      synth.removeEventListener('voiceschanged', chooseVoice)
      synth.cancel()
    }
  }, [text, language])
  if (!voice) return null
  return (
    <button
      type="button"
      className="btn min-h-12"
      onClick={() => {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = voice
        utterance.lang = voice.lang
        utterance.pitch = PROMPT_VOICE.pitch
        utterance.rate = PROMPT_VOICE.rate
        window.speechSynthesis.speak(utterance)
      }}
    >
      <Volume2 aria-hidden="true" />
      {language === 'tl' ? 'Pakinggan' : 'Listen to prompt'}
    </button>
  )
}
