import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  mutateCreateSlpAssignment,
  mutateCreateSlpConsent,
  mutateCreateSlpAttempt,
  mutateUploadSlpRecording,
  mutateSaveSlpReview,
  mutateApproveSlpReview,
  slpWorkflowKeys,
} from '../api/workflow'

export const useCreateSlpAssignmentMutation = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: mutateCreateSlpAssignment,
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: slpWorkflowKeys.assignments })
      await client.invalidateQueries({ queryKey: ['dashboardSummary'] })
    },
  })
}

export const useCreateSlpConsentMutation = () =>
  useMutation({
    mutationFn: mutateCreateSlpConsent,
  })

export const useCreateSlpAttemptMutation = (assignmentId: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof mutateCreateSlpAttempt>[1]) =>
      mutateCreateSlpAttempt(assignmentId, input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: slpWorkflowKeys.assignments }),
  })
}

export const useUploadSlpRecordingMutation = (attemptId: string) => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (recording: Parameters<typeof mutateUploadSlpRecording>[1]) =>
      mutateUploadSlpRecording(attemptId, recording),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: slpWorkflowKeys.assignments })
      await client.invalidateQueries({ queryKey: ['dashboardSummary'] })
    },
  })
}

export const useSaveSlpReviewMutation = (attemptId: string) =>
  useMutation({
    mutationFn: (input: Parameters<typeof mutateSaveSlpReview>[1]) =>
      mutateSaveSlpReview(attemptId, input),
  })

export const useApproveSlpReviewMutation = (reviewId: string) =>
  useMutation({
    mutationFn: () => mutateApproveSlpReview(reviewId),
  })
