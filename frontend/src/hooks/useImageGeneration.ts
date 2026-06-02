import { useState, useCallback, useRef } from 'react';
import { createJob, getJobStatus } from '../api';
import type { Job, AspectRatio } from '../types';

export const useImageGeneration = () => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);
  const consecutiveErrorsRef = useRef<number>(0);
  const MAX_CONSECUTIVE_ERRORS = 3;

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollJobStatus = useCallback((jobId: string) => {
    stopPolling();
    consecutiveErrorsRef.current = 0;

    pollingRef.current = window.setInterval(async () => {
      try {
        const response = await getJobStatus(jobId);

        // Reset error count on success
        consecutiveErrorsRef.current = 0;

        if (response.success && response.data) {
          const updatedJob = response.data;
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            stopPolling();
            setIsLoading(false);
            if (updatedJob.status === 'failed') {
              setError(updatedJob.error || 'The image generation failed. Please try a different prompt.');
            }
          }
        } else {
          // Response was not successful
          throw new Error(response.message || 'Server returned an error');
        }
      } catch (err: any) {
        consecutiveErrorsRef.current += 1;
        console.error(`Polling error (${consecutiveErrorsRef.current}/${MAX_CONSECUTIVE_ERRORS}):`, err);

        if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
          stopPolling();
          setIsLoading(false);
          const msg = err.response?.data?.message || err.message || 'Connection lost';
          setError(`Lost connection to server: ${msg}`);
        }
      }
    }, 1500);
  }, [stopPolling]);

  const generate = useCallback(async (prompt: string, style: string, aspectRatio: string) => {
    if (isLoading) return;

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
        setError(response.message || 'Failed to start generation. Please try again.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setIsLoading(false);

      let msg = 'An unexpected error occurred';
      if (err.code === 'ECONNABORTED') msg = 'Request timed out. Please check your connection.';
      else if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message) msg = err.message;

      setError(msg);
    }
  }, [pollJobStatus, isLoading]);

  const cancel = useCallback(() => {
    stopPolling();
    setIsLoading(false);
    // Keep currentJob if it's completed, but clear if it was still generating
    setCurrentJob(prev => prev?.status === 'completed' ? prev : null);
    setError(null);
  }, [stopPolling]);

  return {
    currentJob,
    isLoading,
    error,
    generate,
    cancel
  };
};
