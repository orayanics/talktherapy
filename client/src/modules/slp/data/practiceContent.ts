export type PracticeLanguage = 'en' | 'tl'
export type PracticeCategory = 'everyday' | 'nature' | 'body'
export type PicturePrompt = {
  id: string
  category: PracticeCategory
  sourceItem: number
  sourceFile: string
  english: string
  filipino: string
  question: Record<PracticeLanguage, string>
}

// Selected vocabulary/pictures from the user-provided fil-pat repository.
// Questions are adapted for practice; source IPA, norms and scoring are not imported.
export const picturePrompts: PicturePrompt[] = [
  {
    id: 'bola',
    category: 'everyday',
    sourceItem: 5,
    sourceFile: 'Item 5.jpg',
    english: 'ball',
    filipino: 'bola',
    question: {
      en: 'What can you bounce and play with?',
      tl: 'Ano ang puwedeng patalbugin at ipanglaro?',
    },
  },
  {
    id: 'sabon',
    category: 'everyday',
    sourceItem: 6,
    sourceFile: 'Item 6 n 48.jpg',
    english: 'soap',
    filipino: 'sabon',
    question: {
      en: 'What do you use to wash your hands?',
      tl: 'Ano ang ginagamit sa paghuhugas ng kamay?',
    },
  },
  {
    id: 'lapis',
    category: 'everyday',
    sourceItem: 10,
    sourceFile: 'Item 10.jpg',
    english: 'pencil',
    filipino: 'lapis',
    question: {
      en: 'What do you use to write or draw?',
      tl: 'Ano ang ginagamit sa pagsulat o pagguhit?',
    },
  },
  {
    id: 'walis',
    category: 'everyday',
    sourceItem: 19,
    sourceFile: 'Item 19.jpg',
    english: 'broom',
    filipino: 'walis',
    question: {
      en: 'What do you use to sweep the floor?',
      tl: 'Ano ang ginagamit sa pagwawalis ng sahig?',
    },
  },
  {
    id: 'tuwalya',
    category: 'everyday',
    sourceItem: 22,
    sourceFile: 'Item 22.jpg',
    english: 'towel',
    filipino: 'tuwalya',
    question: {
      en: 'What dries you after a bath?',
      tl: 'Ano ang ginagamit na pamunas pagkatapos maligo?',
    },
  },
  {
    id: 'pusa',
    category: 'nature',
    sourceItem: 8,
    sourceFile: 'Item 8.jpg',
    english: 'cat',
    filipino: 'pusa',
    question: {
      en: 'Which animal says meow?',
      tl: 'Anong hayop ang nagsasabi ng meow?',
    },
  },
  {
    id: 'isda',
    category: 'nature',
    sourceItem: 18,
    sourceFile: 'Item 18.jpg',
    english: 'fish',
    filipino: 'isda',
    question: {
      en: 'What animal swims in the water?',
      tl: 'Anong hayop ang lumalangoy sa tubig?',
    },
  },
  {
    id: 'ulap',
    category: 'nature',
    sourceItem: 9,
    sourceFile: 'Item 9.jpg',
    english: 'cloud',
    filipino: 'ulap',
    question: {
      en: 'What floats high in the sky?',
      tl: 'Ano ang nakikita sa langit?',
    },
  },
  {
    id: 'puno',
    category: 'nature',
    sourceItem: 14,
    sourceFile: 'Item 14.jpg',
    english: 'tree',
    filipino: 'puno',
    question: {
      en: 'What has a trunk, branches, and leaves?',
      tl: 'Ano ang may mga sanga at dahon?',
    },
  },
  {
    id: 'saging',
    category: 'nature',
    sourceItem: 30,
    sourceFile: 'Item 30.jpg',
    english: 'banana',
    filipino: 'saging',
    question: {
      en: 'What fruit can you peel and eat?',
      tl: 'Anong prutas ang nasa larawan?',
    },
  },
  {
    id: 'mata',
    category: 'body',
    sourceItem: 1,
    sourceFile: 'Item 1 n 27.jpg',
    english: 'eyes',
    filipino: 'mata',
    question: {
      en: 'What do you use to see?',
      tl: 'Ano ang ginagamit natin para makakita?',
    },
  },
  {
    id: 'kamay',
    category: 'body',
    sourceItem: 3,
    sourceFile: 'Item 3 n 33.jpg',
    english: 'hand',
    filipino: 'kamay',
    question: {
      en: 'What do you use to hold things?',
      tl: 'Ano ang ginagamit natin sa paghawak?',
    },
  },
  {
    id: 'ngipin',
    category: 'body',
    sourceItem: 29,
    sourceFile: 'Item 29.jpg',
    english: 'teeth',
    filipino: 'ngipin',
    question: {
      en: 'What do you clean with a toothbrush?',
      tl: 'Ano ang nililinis gamit ang sipilyo?',
    },
  },
  {
    id: 'tenga',
    category: 'body',
    sourceItem: 25,
    sourceFile: 'Item 25 n 31.jpg',
    english: 'ear',
    filipino: 'tenga',
    question: {
      en: 'What do you use to hear?',
      tl: 'Ano ang ginagamit natin para makarinig?',
    },
  },
  {
    id: 'buhok',
    category: 'body',
    sourceItem: 24,
    sourceFile: 'Item 24.jpg',
    english: 'hair',
    filipino: 'buhok',
    question: {
      en: 'What do you brush with a comb?',
      tl: 'Ano ang sinusuklay natin?',
    },
  },
]

export const practiceCategories: {
  id: PracticeCategory
  en: string
  tl: string
}[] = [
  { id: 'everyday', en: 'Everyday things', tl: 'Mga gamit' },
  { id: 'nature', en: 'Animals and nature', tl: 'Hayop at kalikasan' },
  { id: 'body', en: 'Our body', tl: 'Ating katawan' },
]

export const getPictureUrl = (prompt: PicturePrompt) =>
  `/slp/pictures/${prompt.id}.jpg`
export const getPracticeWord = (
  prompt: PicturePrompt,
  language: PracticeLanguage,
) => (language === 'tl' ? prompt.filipino : prompt.english)
