import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import ts from 'typescript'

// Run from any directory; pass the pre-change Git revision as the first argument.
const root = fileURLToPath(new URL('../../', import.meta.url))
const baseline = execFileSync('git', ['rev-parse', process.argv[2] ?? 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
}).trim()
const cases = [
  [
    'Account status (suspend/reactivate)',
    'users/hooks/useActions.tsx',
    'useActions',
    ['users', 'users-count', 'logs', 'dashboardSummary'],
  ],
  [
    'Admin invitation',
    'register/hooks/useRegistrationMutations.ts',
    'useRegisterAdminMutation',
    ['users', 'users-count', 'dashboardSummary', 'logs'],
  ],
  [
    'Clinician invitation',
    'register/hooks/useRegistrationMutations.ts',
    'useRegisterClinicianMutation',
    ['users', 'users-count', 'dashboardSummary', 'logs'],
  ],
  [
    'Patient invitation',
    'register/hooks/useRegistrationMutations.ts',
    'useRegisterPatientInvitationMutation',
    ['users', 'users-count', 'dashboardSummary', 'logs'],
  ],
  [
    'SLP assignment creation',
    'slp/hooks/useWorkflowMutations.ts',
    'useCreateSlpAssignmentMutation',
    ['slp-workflow', 'dashboardSummary'],
  ],
  [
    'SLP recording upload',
    'slp/hooks/useWorkflowMutations.ts',
    'useUploadSlpRecordingMutation',
    ['slp-workflow', 'dashboardSummary'],
  ],
]

function callback(source, name) {
  const ast = ts.createSourceFile(
    'hook.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const matches = []
  function find(node) {
    if (
      (ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name?.getText(ast) === name
    ) {
      function visit(child) {
        if (
          ts.isPropertyAssignment(child) &&
          child.name.getText(ast) === 'onSuccess'
        )
          matches.push(child.initializer.getText(ast))
        ts.forEachChild(child, visit)
      }
      visit(node)
    } else ts.forEachChild(node, find)
  }
  find(ast)
  assert.equal(matches.length, 1, `Expected one success callback in ${name}`)
  return new Function(
    'queryClient',
    'client',
    'showAlert',
    'slpWorkflowKeys',
    `return (${matches[0]})`,
  )
}

async function measure(factory, keys, expectedPeak) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  let active = 0
  let peak = 0
  let calls = 0
  const subscriptions = keys.map((key) => {
    const queryKey = key === 'slp-workflow' ? [key, 'assignments'] : [key]
    client.setQueryData(queryKey, {})
    return new QueryObserver(client, {
      queryKey,
      queryFn: async () => {
        calls++
        peak = Math.max(peak, ++active)
        await setTimeout(50)
        active--
        return {}
      },
    }).subscribe(() => {})
  })
  try {
    const run = factory(client, client, () => assert.equal(active, 0), {
      assignments: ['slp-workflow', 'assignments'],
    })
    const start = performance.now()
    await run()
    const elapsed = performance.now() - start
    assert.equal(calls, keys.length)
    assert.equal(active, 0, 'Callback must await every refetch')
    assert.equal(peak, expectedPeak)
    return elapsed
  } finally {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    client.clear()
  }
}

const percentile = (values, fraction) =>
  [...values].sort((a, b) => a - b)[Math.ceil(values.length * fraction) - 1]
console.log(
  `# Async hot-path performance retest\n\nDate: 2026-11-07. Baseline: \`${baseline}\`; candidate: working-tree callbacks.\n\nControlled Node/TanStack benchmark: one active, seeded query per invalidated family, each refetch waiting 50 ms on a real timer. Runs the actual extracted success callbacks with real QueryClient/QueryObserver instances. Each case has one discarded warm-up pair and 20 measured pairs, alternating baseline/candidate order. Timings cover callback entry through all refetches completing; API mutations, rendering and network/database latency are excluded. p95 uses nearest rank; reduction compares medians.\n\nEnvironment: Node ${process.version}, ${process.platform}/${process.arch}.\n\n| Callback | Active queries | Before median (ms) | After median (ms) | Before p95 (ms) | After p95 (ms) | Median reduction |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
)
for (const [label, relative, name, keys] of cases) {
  const path = `client/src/modules/${relative}`
  const before = callback(
    execFileSync('git', ['show', `${baseline}:${path}`], {
      cwd: root,
      encoding: 'utf8',
    }),
    name,
  )
  const after = callback(readFileSync(`${root}${path}`, 'utf8'), name)
  const samples = [[], []]
  for (let pair = -1; pair < 20; pair++) {
    for (const variant of pair % 2 === 0 ? [0, 1] : [1, 0]) {
      const elapsed = await measure(
        variant === 0 ? before : after,
        keys,
        variant === 0 ? 1 : keys.length,
      )
      if (pair >= 0) samples[variant].push(elapsed)
    }
  }
  const [beforeMedian, afterMedian] = samples.map((values) =>
    percentile(values, 0.5),
  )
  console.log(
    `| ${label} | ${keys.length} | ${beforeMedian.toFixed(2)} | ${afterMedian.toFixed(2)} | ${percentile(samples[0], 0.95).toFixed(2)} | ${percentile(samples[1], 0.95).toFixed(2)} | ${((1 - afterMedian / beforeMedian) * 100).toFixed(1)}% |`,
  )
}
console.log(
  `\nEvery sample asserts the same refetch count, all refetches complete before callback return/alerts, and peak concurrency of one before versus the number of query families after. Regression tests separately exercise the mounted hooks, both status actions and mutation failure behavior.\n\nReproduce from the repository root:\n\n\`\`\`sh\nnode client/scripts/benchmark-invalidations.mjs ${baseline}\n\`\`\`\n\nThese are controlled callback results, not production speedup estimates. Inactive query families do not refetch by default, so real savings depend on which queries are mounted and their response times. Concurrent requests can increase instantaneous server load. The two SLP hooks currently have test callers; these figures do not establish an improvement in the active SLP screen. No live browser, server-load or field latency measurements were performed. Existing backend performance reports are separate and unchanged. No SVGs were generated.`,
)
