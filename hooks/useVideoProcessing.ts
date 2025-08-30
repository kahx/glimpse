import { ProcessingResult } from '@/types/cropping';
import { useMutation } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import { trimVideo } from 'expo-trim-video';

interface VideoProcessingParams {
  inputUri: string;
  startTime: number;
  endTime: number;
}

const processVideo = async ({ 
  inputUri, 
  startTime, 
  endTime
}: VideoProcessingParams): Promise<ProcessingResult> => {
  try {
    // Validate required parameters
    if (!inputUri || inputUri.trim() === '') {
      throw new Error('URI is required');
    }
    
    if (typeof startTime !== 'number' || startTime < 0) {
      throw new Error('Valid start time is required');
    }
    
    if (typeof endTime !== 'number' || endTime <= startTime) {
      throw new Error('Valid end time is required (must be greater than start time)');
    }

    console.log('Video processing parameters:', {
      inputUri,
      startTime,
      endTime,
      inputUriLength: inputUri.length,
      inputUriType: typeof inputUri
    });

    // Verify input file exists
    const inputFileInfo = await FileSystem.getInfoAsync(inputUri);
    if (!inputFileInfo.exists) {
      throw new Error(`Input video file does not exist: ${inputUri}`);
    }
    
    console.log('Input file info:', inputFileInfo);

    console.log('Starting video processing:', {
      inputUri,
      startTime,
      endTime,
      inputFileSize: inputFileInfo.size,
    });

    const trimParams = {
      uri: inputUri,
      start: startTime, // Time in seconds
      end: endTime,     // Time in seconds
    };
    
    console.log('Calling trimVideo with correct params:', trimParams);
    
    const result = await trimVideo(trimParams);
    console.log('Video processing result:', result);
    
    // The function returns the output URI in result.uri
    const actualOutputUri = result.uri;

    // Verify the output file exists using the URI returned by trimVideo
    const fileInfo = await FileSystem.getInfoAsync(actualOutputUri);
    
    if (!fileInfo.exists) {
      throw new Error(`Output video file was not created at: ${actualOutputUri}`);
    }

    console.log('Output file info:', fileInfo);
    console.log('Final output URI:', actualOutputUri);

    return {
      croppedVideoUri: actualOutputUri,
      success: true,
    };
  } catch (error) {
    console.error('Video processing error:', error);
    
    return {
      croppedVideoUri: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during video processing'
    };
  }
};

export const useVideoProcessing = () => {
  return useMutation({
    mutationFn: processVideo,
    onError: (error) => {
      console.error('Video processing mutation error:', error);
    },
    onSuccess: (result) => {
      console.log('Video processing mutation success:', result);
    },
  });
};

// Utility function to get video file size
export const getVideoFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists ? (fileInfo.size || 0) : 0;
  } catch (error) {
    console.error('Error getting video file size:', error);
    return 0;
  }
};

// Utility function to clean up temporary files
export const cleanupTempFiles = async (uris: string[]): Promise<void> => {
  try {
    await Promise.all(
      uris.map(async (uri) => {
        try {
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(uri);
            console.log('Cleaned up temp file:', uri);
          }
        } catch (error) {
          console.warn('Failed to cleanup temp file:', uri, error);
        }
      })
    );
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};
