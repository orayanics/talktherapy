import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const origin = process.argv[2] ?? 'http://localhost:4173'

async function readPage(path, expectedStatus) {
  const response = await fetch(new URL(path, origin), {
    headers: { accept: 'text/html' },
    redirect: 'manual',
  })
  assert.equal(response.status, expectedStatus, `Unexpected status for ${path}`)
  assert.match(response.headers.get('content-type') ?? '', /text\/html/)
  return new JSDOM(await response.text()).window.document
}

const document = await readPage('/', 200)
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
const onboarding = document.querySelector('#how-it-works').textContent
assert.match(onboarding, /verify your email/i)
assert.match(
  onboarding,
  /available slot in Book\s+and\s+complete the intake questions/i,
)
assert.match(onboarding, /Speech Exercises.*Collections.*My assignments/s)

for (const path of ['/login', '/register']) {
  const app = await readPage(path, 200)
  assert.ok(
    app.querySelector('script[type="module"][src]'),
    `Missing app entry for ${path}`,
  )
  assert.equal(
    app.querySelector('#landing-main'),
    null,
    `Homepage served for ${path}`,
  )
}

const missing = await readPage('/__talktherapy_homepage_check_missing__', 404)
assert.equal(
  missing.querySelector('#landing-main'),
  null,
  'Homepage served for unknown URL',
)
console.log('Public homepage, app routes, and unknown URL passed')
