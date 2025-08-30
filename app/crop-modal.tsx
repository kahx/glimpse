import { MetadataInputStep } from '@/components/cropping/MetadataInputStep';
import { VideoCroppingStep } from '@/components/cropping/VideoCroppingStep';
import { VideoProcessingStep } from '@/components/cropping/VideoProcessingStep';
import { VideoSelectionStep } from '@/components/cropping/VideoSelectionStep';
import { useVideoProcessing } from '@/hooks/useVideoProcessing';
import { useVideoStore } from '@/store/videoStore';
import {
  CropModalStep,
  CropSelection,
  SelectedVideo,
  VideoMetadataForm
} from '@/types/cropping';
import { CroppedVideo } from '@/types/video';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CropModal() {
  const insets = useSafeAreaInsets();
  const { addCroppedVideo } = useVideoStore();
  const videoProcessing = useVideoProcessing();
  
  const [currentStep, setCurrentStep] = useState<CropModalStep>('selection');
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
  const [cropSelection, setCropSelection] = useState<CropSelection | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadataForm | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleVideoSelected = (video: SelectedVideo) => {
    setSelectedVideo(video);
    setCurrentStep('cropping');
  };

  const handleCropSelected = (selection: CropSelection) => {
    setCropSelection(selection);
    setCurrentStep('metadata');
  };

  const handleMetadataSubmit = async (metadataForm: VideoMetadataForm) => {
    if (!selectedVideo || !cropSelection) {
      console.error('Missing required data for video processing:', {
        hasSelectedVideo: !!selectedVideo,
        hasCropSelection: !!cropSelection
      });
      return;
    }
    
    console.log('Preparing video processing with data:', {
      selectedVideoUri: selectedVideo.uri,
      selectedVideoUriLength: selectedVideo.uri?.length,
      cropSelection: cropSelection,
      metadataForm: metadataForm
    });
    
    setMetadata(metadataForm);
    setCurrentStep('processing');
    setProcessingProgress(0);

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 0.9) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 0.1;
      });
    }, 500);

    try {
      const processingParams = {
        inputUri: selectedVideo.uri,
        startTime: cropSelection.startTime,
        endTime: cropSelection.endTime
      };
      
      console.log('Calling video processing with params:', processingParams);
      
      const result = await videoProcessing.mutateAsync(processingParams);

      clearInterval(progressInterval);
      setProcessingProgress(1);

      if (result.success && result.croppedVideoUri) {
        // Create the cropped video entry with proper date handling
        const now = new Date();
        const croppedVideo: CroppedVideo = {
          id: Date.now().toString(),
          name: metadataForm.name,
          description: metadataForm.description || '',
          originalVideoUri: selectedVideo.uri,
          croppedVideoUri: result.croppedVideoUri,
          startTime: cropSelection.startTime,
          endTime: cropSelection.endTime,
          createdAt: now,
          thumbnail: result.thumbnail,
        };

        console.log('Created cropped video object:', {
          ...croppedVideo,
          createdAt: now.toISOString(),
          createdAtType: typeof now,
          isValidDate: !isNaN(now.getTime())
        });

        // Add to store
        console.log('About to add video to store...');
        addCroppedVideo(croppedVideo);
        console.log('Video added to store successfully');

        // Show success and navigate back after delay
        setTimeout(() => {
          console.log('Navigating back to main screen...');
          router.back();
        }, 2000);
      } else {
        throw new Error(result.error || 'Video processing failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Video processing error:', error);
      // The error will be shown in VideoProcessingStep via videoProcessing.error
    }
  };

  const handleBackFromCropping = () => {
    setSelectedVideo(null);
    setCropSelection(null);
    setCurrentStep('selection');
  };

  const handleBackFromMetadata = () => {
    setMetadata(null);
    setCurrentStep('cropping');
  };

  const handleRetryProcessing = () => {
    if (metadata) {
      handleMetadataSubmit(metadata);
    }
  };

  const handleCancelProcessing = () => {
    videoProcessing.reset();
    setCurrentStep('metadata');
    setProcessingProgress(0);
  };

  const handleClose = () => {
    if (currentStep === 'processing' && videoProcessing.isPending) {
      Alert.alert(
        'Cancel Processing?',
        'Your video is still being processed. Are you sure you want to cancel?',
        [
          { text: 'Continue Processing', style: 'cancel' },
          { 
            text: 'Cancel', 
            style: 'destructive',
            onPress: () => {
              videoProcessing.reset();
              router.back();
            }
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'selection': return 'Select Video';
      case 'cropping': return 'Crop Video';
      case 'metadata': return 'Add Details';
      case 'processing': return 'Processing';
      default: return 'Create Video Diary Entry';
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'selection': return '1 of 3';
      case 'cropping': return '2 of 3';
      case 'metadata': return '3 of 3';
      case 'processing': return 'Processing';
      default: return '';
    }
  };

  return (
    <View 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={handleClose}
            className="mr-4 p-2 -ml-2"
          >
            <Ionicons name="close" size={24} color="#3B82F6" />
          </Pressable>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white text-center">
              {getStepTitle()}
            </Text>
            {currentStep !== 'processing' && (
              <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Step {getStepNumber()}
              </Text>
            )}
          </View>
          
          <View className="w-8" />
        </View>
      </View>

      {/* Step Content */}
      {currentStep === 'selection' && (
        <VideoSelectionStep 
          onVideoSelected={handleVideoSelected}
          isLoading={false}
        />
      )}

      {currentStep === 'cropping' && selectedVideo && (
        <VideoCroppingStep
          selectedVideo={selectedVideo}
          onCropSelected={handleCropSelected}
          onBack={handleBackFromCropping}
          isLoading={false}
        />
      )}

      {currentStep === 'metadata' && selectedVideo && cropSelection && (
        <MetadataInputStep
          selectedVideo={selectedVideo}
          cropSelection={cropSelection}
          onMetadataSubmit={handleMetadataSubmit}
          onBack={handleBackFromMetadata}
          isLoading={videoProcessing.isPending}
        />
      )}

      {currentStep === 'processing' && (
        <VideoProcessingStep
          isProcessing={videoProcessing.isPending}
          progress={processingProgress}
          error={videoProcessing.error?.message || null}
          onRetry={handleRetryProcessing}
          onCancel={handleCancelProcessing}
        />
      )}
    </View>
  );
}
