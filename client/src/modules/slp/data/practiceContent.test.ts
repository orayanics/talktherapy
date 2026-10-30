import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, it } from 'vitest'
import {
  getPictureUrl,
  getPracticeWord,
  picturePrompts,
  practiceCategories,
} from './practiceContent'

it('provides five complete picture prompts per short activity without missing assets', () => {
  expect(new Set(picturePrompts.map((prompt) => prompt.id)).size).toBe(
    picturePrompts.length,
  )
  for (const category of practiceCategories) {
    expect(
      picturePrompts.filter((prompt) => prompt.category === category.id),
    ).toHaveLength(5)
  }
  for (const prompt of picturePrompts) {
    expect(existsSync(resolve('public', getPictureUrl(prompt).slice(1)))).toBe(
      true,
    )
    expect(getPracticeWord(prompt, 'en')).toBeTruthy()
    expect(getPracticeWord(prompt, 'tl')).toBeTruthy()
    expect(prompt.question.en).toBeTruthy()
    expect(prompt.question.tl).toBeTruthy()
  }
})
