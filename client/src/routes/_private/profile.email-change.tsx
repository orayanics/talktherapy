import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { api } from '#/lib/api/client'
import { PAGE_META } from '#/constants/pageMeta'
import PageLayout from '#/components/Page/PageLayout'

export const Route = createFileRoute('/_private/profile/email-change')({
  staticData: { page: PAGE_META.profile.children.confirmEmail, bcLink: '.' },
  validateSearch: z.object({ code: z.string().length(6).optional() }),
  component: ConfirmEmailChange,
})

function ConfirmEmailChange() {
  const { code: initialCode } = Route.useSearch()
  const [code, setCode] = useState(initialCode ?? '')
  const navigate = useNavigate()
  const confirmation = useMutation({
    mutationFn: () =>
      api('/api/v1/email-change/confirm', {
        method: 'POST',
        data: { otp_code: code },
      }),
    onSuccess: () => navigate({ to: '/profile' }),
  })

  return (
    <PageLayout
      title={PAGE_META.profile.children.confirmEmail.title}
      description={PAGE_META.profile.children.confirmEmail.description}
      paddedCh
    >
      <section className="mx-auto max-w-md space-y-4">
        <h2 className="text-2xl font-semibold">Confirm new email</h2>
        <p>Enter the six-digit code sent to your new address.</p>
        <input
          className="input input-bordered w-full"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          aria-label="Email verification code"
        />
        {confirmation.isError && (
          <p className="text-error">The code is invalid or expired.</p>
        )}
        <button
          className="btn btn-primary w-full"
          disabled={code.length !== 6 || confirmation.isPending}
          onClick={() => confirmation.mutate()}
        >
          Confirm email
        </button>
      </section>
    </PageLayout>
  )
}
