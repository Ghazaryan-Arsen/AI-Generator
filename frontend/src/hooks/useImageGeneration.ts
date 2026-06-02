import { useState, useCallback, useRef, useEffect } from 'react';
import { createJob, getJobStatus } from '../api';
 ai-image-generator-improvements-8591800724981460221
import type { Job, AspectRatio } from '../types';

import type { Job } from '../types';
import axios from 'axios';
 main

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
  }, []);

  const pollJobStatus = useCallback((jobId: string, retryCount = 0) => {
    stopPolling();

    const poll = async () => {
      cancelRequests();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await getJobStatus(jobId, controller.signal);
        if (response.success && response.data) {
          const updatedJob = response.data;
          setCurrentJob(updatedJob);

          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            stopPolling();
            setIsLoading(false);
            if (updatedJob.status === 'failed') {
              setError(updatedJob.error || 'Generation failed');
            }
          } else {
            // Continue polling
            const nextPollDelay = 2000;
            pollingTimeoutRef.current = window.setTimeout(poll, nextPollDelay);
          }
        }
      } catch (err: any) {
        if (axios.isCancel(err)) return;

        console.error('Polling error:', err);

        // Exponential backoff for retries on connection issues
        if (retryCount < 5) {
          const backoffDelay = Math.min(Math.pow(2, retryCount) * 1000, 10000);
          console.warn(`[${new Date().toISOString()}] Polling error for job ${jobId}. Retrying in ${backoffDelay}ms (Attempt ${retryCount + 1}/5)...`, err);
          pollingTimeoutRef.current = window.setTimeout(() => pollJobStatus(jobId, retryCount + 1), backoffDelay);
        } else {
          stopPolling();
          setIsLoading(false);
          setError('Lost connection to the server. Please check your internet or try again later.');
        }
      }
 ai-image-generator-improvements-8591800724981460221
    }, 1500); // Poll slightly faster for better responsiveness
  }, [stopPolling]);

  const generate = useCallback(async (prompt: string, style: string, aspectRatio: string) => {
    if (isLoading) return; // Prevent duplicate requests

    };

    pollingTimeoutRef.current = window.setTimeout(poll, 2000);
  }, [stopPolling, cancelRequests]);

  const generate = useCallback(async (prompt: string, style: string, aspectRatio: string) => {
    cancelRequests();
    stopPolling();
 main

    setIsLoading(true);
    setError(null);
    setCurrentJob(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
 ai-image-generator-improvements-8591800724981460221
      const response = await createJob(prompt, style, aspectRatio as AspectRatio);

      console.log(`[${new Date().toISOString()}] Starting image generation: prompt="${prompt}", style="${style}"`);
      const response = await createJob(prompt, style, aspectRatio, controller.signal);
 main
      if (response.success && response.data) {
        console.log(`[${new Date().toISOString()}] Job created: ${response.data.id}`);
        setCurrentJob(response.data);
        pollJobStatus(response.data.id);
      } else {
        console.error(`[${new Date().toISOString()}] Failed to create job:`, response.message);
        setIsLoading(false);
        setError(response.message || 'Failed to start generation');
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log(`[${new Date().toISOString()}] Generation request cancelled.`);
        return;
      }

      console.error(`[${new Date().toISOString()}] Generation error:`, err);
      setIsLoading(false);

      const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(message);
    }
 ai-image-generator-improvements-8591800724981460221
  }, [pollJobStatus, isLoading]);

  }, [pollJobStatus, stopPolling, cancelRequests]);
 main

  const cancel = useCallback(() => {
    cancelRequests();
    stopPolling();
    setIsLoading(false);
    setCurrentJob(null);
  }, [stopPolling, cancelRequests]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      cancelRequests();
    };
  }, [stopPolling, cancelRequests]);

  return {
    currentJob,
    isLoading,
    error,
    generate,
    cancel
  };
};
