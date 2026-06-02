import { useState, useCallback, useRef } from 'react';
import { createJob, getJobStatus } from '../api';
import type { Job, AspectRatio } from '../types';

export const useImageGeneration = () => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback((jobId: string) => {
    stopPolling();

    pollingRef.current = window.setInterval(async () => {
      try {
        const response = await getJobStatus(jobId);
        if (response.success && response.data) {
          const updatedJob = response.data;
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            stopPolling();
            setIsLoading(false);
            if (updatedJob.status === 'failed') {
              setError(updatedJob.error || 'Generation failed');
            }
          }
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        stopPolling();
        setIsLoading(false);
        setError('Lost connection to the server');
      }
    }, 1500); // Poll slightly faster for better responsiveness
  }, [stopPolling]);

  const generate = useCallback(async (prompt: string, style: string, aspectRatio: string) => {
    if (isLoading) return; // Prevent duplicate requests

    setIsLoading(true);
    setError(null);
    setCurrentJob(null);

    try {
      const response = await createJob(prompt, style, aspectRatio as AspectRatio);
      if (response.success && response.data) {
        setCurrentJob(response.data);
        pollJobStatus(response.data.id);
      } else {
        setIsLoading(false);
        setError(response.message || 'Failed to start generation');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setIsLoading(false);
      setError(err.response?.data?.message || 'An unexpected error occurred');
    }
  }, [pollJobStatus, isLoading]);

  const cancel = useCallback(() => {
    stopPolling();
    setIsLoading(false);
    setCurrentJob(null);
  }, [stopPolling]);

  return {
    currentJob,
    isLoading,
    error,
    generate,
    cancel
  };
};
