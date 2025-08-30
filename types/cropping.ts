import { z } from 'zod';

/**
 * Types and schemas for the video cropping workflow
 */

// Step 1: Video Selection
export interface SelectedVideo {
  uri: string;
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
}

// Step 2: Cropping Interface
export interface CropSelection {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface CropBounds {
  minDuration: number;
  maxDuration: number;
  videoDuration: number;
}

// Step 3: Metadata Input
export const VideoMetadataSchema = z.object({
  name: z.string()
    .min(1, 'Video name is required')
    .max(100, 'Video name must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .optional()
});

export type VideoMetadataForm = z.infer<typeof VideoMetadataSchema>;

// Crop Modal State
export type CropModalStep = 'selection' | 'cropping' | 'metadata' | 'processing';

export interface CropModalState {
  step: CropModalStep;
  selectedVideo: SelectedVideo | null;
  cropSelection: CropSelection | null;
  metadata: VideoMetadataForm | null;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
}

// Video Processing
export interface TrimVideoParams {
  inputUri: string;
  startTime: number;
  endTime: number;
  outputUri?: string;
}

export interface ProcessingResult {
  croppedVideoUri: string;
  thumbnail?: string;
  success: boolean;
  error?: string;
}

// Constants
export const CROP_CONSTANTS = {
  REQUIRED_DURATION: 5.0, // exactly 5 seconds
  MIN_DURATION: 4.9, // allow slight tolerance
  MAX_DURATION: 5.1, // allow slight tolerance
  SUPPORTED_FORMATS: [
    'video/mp4',
    'video/mov', 
    'video/avi',
    'video/quicktime', // iOS records .mov files with this MIME type
    'video/x-msvideo', // alternative AVI MIME type
  ],
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
} as const;
