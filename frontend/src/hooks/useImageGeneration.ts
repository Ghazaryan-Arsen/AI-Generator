import { useState, useCallback, useRef } from 'react';
import { createJob, getJobStatus } from '../api';
import type { Job, AspectRatio } from '../types';

export const useImageGeneration = () => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopPolling();
  }, [stopPolling]);

  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const job = await getJobStatus(jobId);

      setCurrentJob(job);

      if (job.status === 'completed') {
        setIsLoading(false);
        stopPolling();
        return;
      }

      if (job.status === 'failed') {
        setIsLoading(false);
        setError('Image generation failed');
        stopPolling();
        return;
      }

      pollingTimeoutRef.current = window.setTimeout(() => {
        pollJobStatus(jobId);
      }, 2000);

    } catch (err: any) {
      setIsLoading(false);
      setError('Lost connection to server');
      stopPolling();
    }
  }, [stopPolling]);

  const generate = useCallback(async (
    prompt: string,
    style: string,
    aspectRatio: string
  ) => {
    if (isLoading) return;

    cancelRequests();
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await createJob(
        prompt,
        style,
        aspectRatio as AspectRatio,
        controller.signal
      );

      if (response.success && response.data) {
        setCurrentJob(response.data);
        pollJobStatus(response.data.id);
      } else {
        throw new Error('Failed to create job');
      }

    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred';

      setError(message);
      setIsLoading(false);
    }
  }, [isLoading, pollJobStatus, cancelRequests]);

  const cancel = useCallback(() => {
    cancelRequests();
    setIsLoading(false);
  }, [cancelRequests]);

  return {
    currentJob,
    isLoading,
    error,
    generate,
    cancel
  };
};
