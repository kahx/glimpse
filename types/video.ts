/**
 * Core video data types for the glimpse.
 */

export interface CroppedVideo {
  id: string;
  name: string;
  description: string;
  originalVideoUri: string;
  croppedVideoUri: string;
  startTime: number;
  endTime: number;
  createdAt: Date;
  thumbnail?: string;
}

export interface VideoMetadata {
  name: string;
  description: string;
}

export interface VideoProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}

export interface CropSelection {
  startTime: number;
  endTime: number;
  duration: number;
}
