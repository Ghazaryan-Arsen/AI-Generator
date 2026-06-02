import { v4 as uuidv4 } from 'uuid';
import { Job } from '../types/index.js';
import { hfService } from './hfService.js';
import { storageService } from './storageService.js';
import { promptService } from './promptService.js';

export class JobService {
  private static instance: JobService;
  private jobs: Map<string, Job> = new Map();
  private readonly MAX_JOBS = 100;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

  private constructor() {
    this.startCleanupInterval();
  }

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  public createJob(prompt: string, style?: string, aspectRatio?: string): Job {
    const id = uuidv4();
    const job: Job = {
      id,
      prompt,
      style,
      aspectRatio,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (this.jobs.size >= this.MAX_JOBS) {
      // Remove oldest job
      const oldestId = Array.from(this.jobs.keys())[0];
      this.jobs.delete(oldestId);
    }

    this.jobs.set(id, job);
    this.processJob(id); // Async start processing
    return job;
  }

  public getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  public getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  private updateJob(id: string, updates: Partial<Job>) {
    const job = this.jobs.get(id);
    if (job) {
      const updatedJob = { ...job, ...updates, updatedAt: new Date() };
      this.jobs.set(id, updatedJob);
    }
  }

  private async processJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) return;

    try {
      this.updateJob(id, { status: 'processing', progress: 10 });

      const enhancedPrompt = promptService.enhancePrompt(job.prompt, job.style);
      this.updateJob(id, { progress: 30 });

      const buffer = await hfService.generateImage(enhancedPrompt);
      this.updateJob(id, { progress: 80 });

      const fileName = `generated-${id}.jpg`;
      const imageUrl = await storageService.saveImage(buffer, fileName);

      this.updateJob(id, {
        status: 'completed',
        progress: 100,
        imageUrl
      });
    } catch (error: any) {
      console.error(`Job ${id} failed:`, error.message);
      this.updateJob(id, {
        status: 'failed',
        error: error.message || 'Failed to generate image',
        progress: 100
      });
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - 3600000;

      for (const [id, job] of this.jobs.entries()) {
        if (job.createdAt.getTime() < oneHourAgo) {
          this.jobs.delete(id);
          console.log(`Cleaned up old job: ${id}`);
        }
      }

      storageService.cleanOldFiles();
    }, this.CLEANUP_INTERVAL);
  }
}

export const jobService = JobService.getInstance();
