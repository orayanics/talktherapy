import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const origin = process.argv[2] ?? 'http://localhost:4173'
const response = await fetch(new URL('/', origin), { redirect: 'manual' })
assert.equal(response.status, 200)

const { document } = new JSDOM(await response.text()).window
assert.match(document.title, /TalkTherapy.*Speech therapy/i)
assert.match(
  document.querySelector('meta[name="description"]')?.content ?? '',
  /TalkTherapy.*appointments.*practice/i,
)
assert.equal(document.querySelectorAll('h1').length, 1)
assert.equal(
  document.querySelector('h1').textContent.trim(),
  'Speech therapy appointments and practice in one place',
)
for (const [path, label] of [
  ['/register', 'Create a patient account'],
  ['/login', 'Log in'],
]) {
  assert.ok(
    [...document.querySelectorAll(`a[href="${path}"]`)].some(
      (link) => link.textContent.trim() === label,
    ),
    `Missing ${label} link`,
  )
}
for (const summary of [
  /request an available appointment/i,
  /English and Filipino/i,
  /learning resources/i,
  /notes and records/i,
]) {
  assert.match(document.querySelector('main').textContent, summary)
}
assert.match(
  document.querySelector('#how-it-works').textContent,
  /verify your email/i,
)
console.log('Public homepage HTML passed')
