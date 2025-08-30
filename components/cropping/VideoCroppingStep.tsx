import { CROP_CONSTANTS, CropSelection, SelectedVideo } from '@/types/cropping';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

interface VideoCroppingStepProps {
  selectedVideo: SelectedVideo;
  onCropSelected: (selection: CropSelection) => void;
  onBack: () => void;
  isLoading: boolean;
}

const SCRUBBER_WIDTH = 300;
const HANDLE_WIDTH = 20;
const SEGMENT_COLOR = '#3B82F6';

export function VideoCroppingStep({ 
  selectedVideo, 
  onCropSelected, 
  onBack, 
  isLoading 
}: VideoCroppingStepProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(selectedVideo.duration);
  const [cropStart, setCropStart] = useState(0);
  const [cropEnd, setCropEnd] = useState(Math.min(CROP_CONSTANTS.REQUIRED_DURATION, selectedVideo.duration));
  
  const player = useVideoPlayer(selectedVideo.uri, player => {
    player.loop = false;
    player.play();
    setIsPlaying(true);
    
    // Get the actual duration from the video player
    player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay' && player.duration) {
        console.log('Video player duration:', player.duration);
        console.log('Original duration from picker:', selectedVideo.duration);
        
        // Use the player's duration if it's different and seems more reasonable
        if (Math.abs(player.duration - selectedVideo.duration) > 1) {
          console.log('Using player duration instead of picker duration');
          setActualDuration(player.duration);
          setCropEnd(Math.min(CROP_CONSTANTS.REQUIRED_DURATION, player.duration));
        }
      }
    });
  });

  const startPosition = useSharedValue(0);
  const endPosition = useSharedValue((CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH);
  const startInitialPosition = useSharedValue(0);
  const endInitialPosition = useSharedValue(0);

  // Update end position when actual duration changes
  useEffect(() => {
    endPosition.value = (CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH;
  }, [actualDuration, endPosition]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && isPlaying) {
        setCurrentTime(player.currentTime || 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, isPlaying]);

  // Debug effect to monitor video duration
  useEffect(() => {
    console.log('Video duration from picker:', selectedVideo.duration);
    console.log('Actual duration being used:', actualDuration);
    console.log('Current crop values:', { cropStart, cropEnd });
  }, [selectedVideo.duration, actualDuration, cropStart, cropEnd]);

  // Additional effect to monitor crop value changes
  useEffect(() => {
    console.log('Crop values changed:', { cropStart, cropEnd });
  }, [cropStart, cropEnd]);

  const updateCropTimesJS = useCallback((startTime: number, endTime: number) => {
    // Clamp values to ensure they're within valid range
    const clampedStartTime = Math.max(0, Math.min(startTime, actualDuration));
    const clampedEndTime = Math.max(0, Math.min(endTime, actualDuration));
    
    console.log('Updating crop times:', { 
      startTime: clampedStartTime, 
      endTime: clampedEndTime, 
      videoDuration: actualDuration 
    });
    
    setCropStart(clampedStartTime);
    setCropEnd(clampedEndTime);
  }, [actualDuration]);

  const updateCropTimes = useCallback((startPos: number, endPos: number) => {
    'worklet';
    // Ensure positions are valid numbers
    if (isNaN(startPos) || isNaN(endPos) || startPos < 0 || endPos < 0) {
      return;
    }
    
    const startTime = (startPos / SCRUBBER_WIDTH) * actualDuration;
    const endTime = (endPos / SCRUBBER_WIDTH) * actualDuration;
    
    // Validate the times to prevent NaN or invalid values
    if (isNaN(startTime) || isNaN(endTime) || startTime < 0 || endTime < 0 || endTime > actualDuration) {
      console.warn('Invalid times calculated:', { startTime, endTime, startPos, endPos, videoDuration: actualDuration });
      return;
    }
    
    runOnJS(updateCropTimesJS)(startTime, endTime);
  }, [actualDuration, updateCropTimesJS]);

  const constrainPositions = useCallback((newStartPos: number, newEndPos: number) => {
    'worklet';
    const requiredPixels = (CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH;
    
    // Validate inputs
    if (isNaN(newStartPos) || isNaN(newEndPos) || isNaN(requiredPixels)) {
      return { startPos: 0, endPos: requiredPixels };
    }
    
    // Ensure exactly 5 seconds
    if (Math.abs(newEndPos - newStartPos - requiredPixels) > 0.1) {
      newEndPos = newStartPos + requiredPixels;
    }
    
    // Ensure within bounds
    if (newEndPos > SCRUBBER_WIDTH) {
      newEndPos = SCRUBBER_WIDTH;
      newStartPos = newEndPos - requiredPixels;
    }
    
    if (newStartPos < 0) {
      newStartPos = 0;
      newEndPos = requiredPixels;
    }
    
    return { startPos: newStartPos, endPos: newEndPos };
  }, [actualDuration]);

  const startGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      startInitialPosition.value = startPosition.value;
    })
    .onUpdate((event) => {
      'worklet';
      const requiredPixels = (CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH;
      const maxStartPos = SCRUBBER_WIDTH - requiredPixels;
      
      // Validate translation value
      if (isNaN(event.translationX)) {
        return;
      }
      
      const newStartPos = clamp(
        startInitialPosition.value + event.translationX, 
        0, 
        maxStartPos
      );
      const newEndPos = newStartPos + requiredPixels;
      
      const constrained = constrainPositions(newStartPos, newEndPos);
      
      // Validate constrained values before assignment
      if (!isNaN(constrained.startPos) && !isNaN(constrained.endPos)) {
        startPosition.value = constrained.startPos;
        endPosition.value = constrained.endPos;
        updateCropTimes(constrained.startPos, constrained.endPos);
      }
    });

  const endGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      endInitialPosition.value = endPosition.value;
    })
    .onUpdate((event) => {
      'worklet';
      const requiredPixels = (CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH;
      const minEndPos = requiredPixels;
      
      // Validate translation value
      if (isNaN(event.translationX)) {
        return;
      }
      
      const newEndPos = clamp(
        endInitialPosition.value + event.translationX, 
        minEndPos, 
        SCRUBBER_WIDTH
      );
      const newStartPos = newEndPos - requiredPixels;
      
      const constrained = constrainPositions(newStartPos, newEndPos);
      
      // Validate constrained values before assignment
      if (!isNaN(constrained.startPos) && !isNaN(constrained.endPos)) {
        startPosition.value = constrained.startPos;
        endPosition.value = constrained.endPos;
        updateCropTimes(constrained.startPos, constrained.endPos);
      }
    });

  const startHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: startPosition.value }],
  }));

  const endHandleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: endPosition.value - HANDLE_WIDTH }],
  }));

  const segmentStyle = useAnimatedStyle(() => ({
    left: startPosition.value,
    width: endPosition.value - startPosition.value,
  }));

  const togglePlayback = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    // Handle invalid inputs
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
    // Clamp to reasonable values (max 99:59)
    const clampedSeconds = Math.min(seconds, 5999);
    const mins = Math.floor(clampedSeconds / 60);
    const secs = Math.floor(clampedSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmSelection = () => {
    const selection: CropSelection = {
      startTime: cropStart,
      endTime: cropEnd,
      duration: cropEnd - cropStart,
    };
    onCropSelected(selection);
  };

  const currentProgress = (currentTime / actualDuration) * SCRUBBER_WIDTH;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Video Player */}
      <View className="bg-black mx-4 mt-6 rounded-xl overflow-hidden">
        <VideoView
          style={{ width: '100%', aspectRatio: 16/9 }}
          player={player}
          allowsFullscreen={false}
          showsTimecodes={false}
          requiresLinearPlayback={false}
        />
        
        {/* Play/Pause Overlay */}
        <Pressable
          onPress={togglePlayback}
          className="absolute inset-0 items-center justify-center"
        >
          <View className="bg-black/50 rounded-full p-4">
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={32} 
              color="white" 
            />
          </View>
        </Pressable>
      </View>

      {/* Cropping Controls */}
      <View className="flex-1 px-6 py-8">
        <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
          Select 5-Second Segment
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-sm mb-8">
          Drag the handles to choose exactly 5 seconds from your video
        </Text>

        {/* Timeline Scrubber */}
        <View className="items-center mb-8">
          <View 
            className="relative bg-gray-300 dark:bg-gray-700 rounded-full mb-4"
            style={{ width: SCRUBBER_WIDTH, height: 6 }}
          >
            {/* Progress indicator */}
            <View 
              className="absolute top-0 bg-gray-500 dark:bg-gray-400 rounded-full h-full"
              style={{ 
                width: Math.max(2, currentProgress),
                left: 0 
              }}
            />
            
            {/* Selected segment */}
            <Animated.View 
              className="absolute top-0 rounded-full h-full"
              style={[
                { backgroundColor: SEGMENT_COLOR },
                segmentStyle
              ]}
            />
            
            {/* Start handle */}
            <GestureDetector gesture={startGesture}>
              <Animated.View 
                className="absolute -top-2 w-5 h-10 bg-blue-500 rounded-lg border-2 border-white shadow-md"
                style={startHandleStyle}
              />
            </GestureDetector>
            
            {/* End handle */}
            <GestureDetector gesture={endGesture}>
              <Animated.View 
                className="absolute -top-2 w-5 h-10 bg-blue-500 rounded-lg border-2 border-white shadow-md"
                style={endHandleStyle}
              />
            </GestureDetector>
          </View>
          
          {/* Time indicators */}
          <View className="flex-row justify-between w-full max-w-xs">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Start: {formatTime(cropStart)}
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              Duration: {(cropEnd - cropStart).toFixed(1)}s
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              End: {formatTime(cropEnd)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <Pressable
            onPress={handleConfirmSelection}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 p-4 rounded-xl shadow-sm"
          >
            <Text className="text-white font-semibold text-base text-center">
              {isLoading ? 'Loading...' : 'Continue with This Selection'}
            </Text>
          </Pressable>
          
          <Pressable
            onPress={onBack}
            disabled={isLoading}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 disabled:bg-gray-400 p-4 rounded-xl"
          >
            <Text className="text-gray-800 dark:text-gray-200 font-medium text-base text-center">
              Choose Different Video
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
