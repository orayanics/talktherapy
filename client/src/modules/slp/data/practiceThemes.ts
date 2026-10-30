import { Fish, Leaf, Rocket } from 'lucide-react'

export const practiceThemes = [
  {
    id: 'jungle',
    label: 'Forest trail',
    icon: Leaf,
    greeting: 'A little discovery, one picture at a time.',
    finish: 'Thanks for exploring the trail!',
  },
  {
    id: 'ocean',
    label: 'Ocean friends',
    icon: Fish,
    greeting: 'Take a calm little dive into picture practice.',
    finish: 'Thanks for diving in!',
  },
  {
    id: 'space',
    label: 'Space explorers',
    icon: Rocket,
    greeting: 'Ready for a small picture mission?',
    finish: 'Your picture mission is complete!',
  },
] as const

export type PracticeThemeId = (typeof practiceThemes)[number]['id']
