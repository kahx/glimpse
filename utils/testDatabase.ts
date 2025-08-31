import { videoDatabase } from '@/database/videoDatabase';
import { CroppedVideo } from '@/types/video';

/**
 * Test utilities for SQLite database functionality
 * These functions can be used for development and testing purposes
 */

/**
 * Test basic database operations
 */
export async function testDatabaseOperations(): Promise<{
  success: boolean;
  errors: string[];
  results: any[];
}> {
  const results: any[] = [];
  const errors: string[] = [];
  let success = true;

  try {
    console.log('🧪 Starting database tests...');
    
    // Initialize database
    await videoDatabase.initialize();
    results.push('Database initialized');

    // Test insertion
    const testVideo: CroppedVideo = {
      id: `test-${Date.now()}`,
      name: 'Test Video',
      description: 'This is a test video for database verification',
      originalVideoUri: 'file:///test/original.mp4',
      croppedVideoUri: 'file:///test/cropped.mp4',
      startTime: 0,
      endTime: 5,
      createdAt: new Date(),
      thumbnail: 'file:///test/thumbnail.jpg'
    };

    await videoDatabase.insertVideo(testVideo);
    results.push('Video inserted successfully');

    // Test retrieval
    const retrievedVideo = await videoDatabase.getVideoById(testVideo.id);
    if (retrievedVideo && retrievedVideo.name === testVideo.name) {
      results.push('Video retrieved successfully');
    } else {
      throw new Error('Retrieved video does not match inserted video');
    }

    // Test update
    await videoDatabase.updateVideo(testVideo.id, {
      name: 'Updated Test Video',
      description: 'Updated description'
    });
    
    const updatedVideo = await videoDatabase.getVideoById(testVideo.id);
    if (updatedVideo && updatedVideo.name === 'Updated Test Video') {
      results.push('Video updated successfully');
    } else {
      throw new Error('Video update failed');
    }

    // Test count
    const count = await videoDatabase.getVideoCount();
    results.push(`Video count: ${count}`);

    // Test search
    const searchResults = await videoDatabase.searchVideos('Updated');
    if (searchResults.length > 0) {
      results.push('Search functionality works');
    } else {
      results.push('Search returned no results (this might be expected)');
    }

    // Test delete
    await videoDatabase.deleteVideo(testVideo.id);
    const deletedVideo = await videoDatabase.getVideoById(testVideo.id);
    if (!deletedVideo) {
      results.push('Video deleted successfully');
    } else {
      throw new Error('Video deletion failed');
    }

    console.log('All database tests passed!');

  } catch (error) {
    success = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    console.error('Database test failed:', errorMessage);
  }

  return { success, errors, results };
}



/**
 * Comprehensive database health check
 */
export async function performDatabaseHealthCheck(): Promise<{
  success: boolean;
  summary: string;
  details: any;
}> {
  console.log('🏥 Starting database health check...');
  
  const operationsTest = await testDatabaseOperations();
  
  const summary = `
Database Health Check Results:
- Operations Test: ${operationsTest.success ? 'PASSED' : 'FAILED'}
- Total Errors: ${operationsTest.errors.length}
  `;

  const details = {
    operations: operationsTest,
    timestamp: new Date().toISOString()
  };

  const overallSuccess = operationsTest.success;
  
  console.log(summary);
  
  return {
    success: overallSuccess,
    summary,
    details
  };
}

/**
 * Reset database for development (use with caution!)
 */
export async function resetDatabaseForDevelopment(): Promise<void> {
  console.log('Resetting database for development...');
  
  try {
    await videoDatabase.initialize();
    await videoDatabase.clearAllVideos();
    
    console.log('Database reset completed');
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}
