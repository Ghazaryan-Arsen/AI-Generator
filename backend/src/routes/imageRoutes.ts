import { Router } from 'express';
import { body } from 'express-validator';
import { ImageController } from '../controllers/imageController.js';

const router = Router();

router.post(
  '/generate-image',
  [
    body('prompt')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Prompt is required')
      .isLength({ max: 500 })
      .withMessage('Prompt too long'),
    body('style').optional().isString(),
    body('aspectRatio').optional().isString()
  ],
  ImageController.generateImage
);

router.get('/job-status/:id', ImageController.getJobStatus);
router.get('/jobs', ImageController.getJobs);

export default router;
