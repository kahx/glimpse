/**
 * Database module exports
 * 
 * This module provides SQLite database functionality for the Glimpse Video Diary app.
 * It includes:
 * - Video metadata storage and retrieval
 * - CRUD operations for video entries
 */

export { videoDatabase } from './videoDatabase';

// Re-export database types for convenience
export type { CroppedVideo } from '@/types/video';
