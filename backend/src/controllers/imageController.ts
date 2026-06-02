import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { jobService } from '../services/jobService.js';
import { ApiResponse, Job } from '../types/index.js';

export class ImageController {
  public static async generateImage(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      };
      return res.status(400).json(response);
    }

    try {
      const { prompt, style, aspectRatio } = req.body;

      console.log(`[${new Date().toISOString()}] Generation request received: prompt="${prompt}", style="${style}"`);

      const job = jobService.createJob(prompt, style, aspectRatio);

      const response: ApiResponse<Job> = {
        success: true,
        data: job
      };
      res.status(202).json(response);
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Controller Error:`, error.message);
      const response: ApiResponse<null> = {
        success: false,
        message: error.message || 'Failed to initiate image generation'
      };
      res.status(500).json(response);
    }
  }

  public static async getJobStatus(req: Request, res: Response) {
    const { id } = req.params;
    const job = jobService.getJob(id as string);

    if (!job) {
      const response: ApiResponse<null> = {
        success: false,
        message: 'Job not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Job> = {
      success: true,
      data: job
    };
    res.status(200).json(response);
  }

  public static async getJobs(req: Request, res: Response) {
    const jobs = jobService.getAllJobs();
    const response: ApiResponse<Job[]> = {
      success: true,
      data: jobs
    };
    res.status(200).json(response);
  }
}
