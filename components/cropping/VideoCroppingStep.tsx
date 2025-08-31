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
  const [playerReady, setPlayerReady] = useState(false);
  
  const player = useVideoPlayer(selectedVideo.uri, player => {
    player.loop = false;
    player.pause();
    setIsPlaying(false);
  });

  // Calculate the width of the segment in pixels (5 seconds)
  const segmentWidthPixels = (CROP_CONSTANTS.REQUIRED_DURATION / actualDuration) * SCRUBBER_WIDTH;
  
  // Shared value for the segment position
  const segmentPosition = useSharedValue(0);
  const segmentInitialPosition = useSharedValue(0);

  // Initialize player
  useEffect(() => {
    if (!player) return;
    
    const statusListener = player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay' && player.duration) {
        console.log('Video player ready with duration:', player.duration);
        
        if (Math.abs(player.duration - selectedVideo.duration) > 1) {
          console.log('Using player duration instead of segmentation duration');
          setActualDuration(player.duration);
          setCropEnd(Math.min(CROP_CONSTANTS.REQUIRED_DURATION, player.duration));
        }
        
        setPlayerReady(true);
      }
      
      // Handle video ending - restart loop if we were playing
      if (status.status === 'idle' && isPlaying && playerReady) {
        console.log('Video ended, restarting loop');
        player.currentTime = cropStart;
        setCurrentTime(cropStart);
        setTimeout(() => {
          player.play();
        }, 100);
      }
    });

    return () => {
      statusListener?.remove();
    };
  }, [player, selectedVideo.duration, isPlaying, playerReady, cropStart]);

  // Monitor current time
  useEffect(() => {
    if (!player) return;
    
    const interval = setInterval(() => {
      if (isPlaying && player.currentTime !== undefined) {
        // While playing, reflect the player's current time
        setCurrentTime(player.currentTime);
        
        // Loop within segment when playing
        // Use a small buffer (0.1s) before the end to ensure we catch the loop point
        // especially important when segment is at the end of the video
        const loopPoint = Math.min(cropEnd - 0.1, actualDuration - 0.1);
        
        if (player.currentTime >= loopPoint) {
          player.currentTime = cropStart;
          setCurrentTime(cropStart);
        }
      }
    }, 50); // Reduced interval for more responsive looping

    return () => clearInterval(interval);
  }, [player, isPlaying, cropStart, cropEnd, actualDuration]);

  const updateCropTimesJS = useCallback((position: number) => {
    const startTime = (position / SCRUBBER_WIDTH) * actualDuration;
    
    // Ensure we don't go past the video duration
    const clampedStart = Math.max(0, Math.min(startTime, actualDuration - CROP_CONSTANTS.REQUIRED_DURATION));
    const clampedEnd = Math.min(clampedStart + CROP_CONSTANTS.REQUIRED_DURATION, actualDuration);
    
    console.log('Updating crop times:', { 
      startTime: clampedStart, 
      endTime: clampedEnd
    });
    
    setCropStart(clampedStart);
    setCropEnd(clampedEnd);
    
    // Always update preview to show the start of the selection
    if (player && playerReady) {
      player.currentTime = clampedStart;
      setCurrentTime(clampedStart);
    }
  }, [actualDuration, player, playerReady]);

  const updateCropTimes = useCallback((position: number) => {
    'worklet';
    runOnJS(updateCropTimesJS)(position);
  }, [updateCropTimesJS]);

  // Single gesture for dragging the entire segment
  const segmentGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      segmentInitialPosition.value = segmentPosition.value;
    })
    .onUpdate((event) => {
      'worklet';
      const maxPosition = SCRUBBER_WIDTH - segmentWidthPixels;
      const newPosition = clamp(
        segmentInitialPosition.value + event.translationX,
        0,
        maxPosition
      );
      
      segmentPosition.value = newPosition;
      updateCropTimes(newPosition);
    });

  const segmentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: segmentPosition.value }],
    width: segmentWidthPixels,
  }));

  const togglePlayback = () => {
    if (player && playerReady) {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        // Seek to crop start and play
        player.currentTime = cropStart;
        setCurrentTime(cropStart);
        
        // Small delay to let seek complete, then start playing and re-enable monitoring
        setTimeout(() => {
          player.play();
          setIsPlaying(true);
        }, 300);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
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

  // Calculate progress position on the scrubber
  const currentProgress = ((currentTime / actualDuration) * SCRUBBER_WIDTH);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Video Player */}
      <View className="bg-black mx-4 mt-6 rounded-xl overflow-hidden">
        <VideoView
          style={{ width: '100%', aspectRatio: 16/9 }}
          player={player}
          allowsFullscreen={false}
          showsTimecodes={false}
          nativeControls={false}
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
        
        {/* Segment indicator overlay */}
        <View className="absolute bottom-2 left-2 right-2 flex-row justify-between">
          <View className="bg-black/70 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">
              {formatTime(cropStart)} - {formatTime(cropEnd)}
            </Text>
          </View>
          <View className="bg-black/70 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium">
              {formatTime(currentTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* Cropping Controls */}
      <View className="flex-1 px-6 py-8">
        <Text className="text-gray-900 dark:text-white text-xl font-bold text-center mb-2">
          Select 5-Second Segment
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-sm mb-4">
          Drag the blue segment to choose your 5-second clip
        </Text>
        
        {/* Playback indicator */}
        <View className="flex-row items-center justify-center mb-4">
          <View className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`} />
          <Text className="text-gray-600 dark:text-gray-400 text-xs">
            {isPlaying ? 'Playing selected segment' : 'Preview paused'}
          </Text>
        </View>

        {/* Timeline Scrubber */}
        <View className="items-center mb-8">
          <View 
            className="relative bg-gray-300 dark:bg-gray-700 rounded-full mb-4"
            style={{ width: SCRUBBER_WIDTH, height: 12 }}
          >
            {/* Current playback position indicator */}
            {currentTime >= cropStart && currentTime <= cropEnd && (
              <View 
                className="absolute top-0 bg-white z-20 rounded-full"
                style={{ 
                  width: 2,
                  height: 12,
                  left: currentProgress
                }}
              />
            )}
            
            {/* Draggable selected segment */}
            <GestureDetector gesture={segmentGesture}>
              <Animated.View 
                className="absolute top-0 rounded-full h-full z-10"
                style={[
                  { 
                    backgroundColor: SEGMENT_COLOR,
                    height: 12,
                  },
                  segmentStyle
                ]}
              >
                {/* Visual handles on the segment */}
                <View className="absolute -left-1 -top-1 w-2 h-2 bg-white rounded-full border border-blue-500" />
                <View className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full border border-blue-500" />
              </Animated.View>
            </GestureDetector>
          </View>
          
          {/* Time indicators */}
          <View className="flex-row justify-between w-full max-w-xs">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Start: {formatTime(cropStart)}
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
              Duration: 5.0s
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              End: {formatTime(cropEnd)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4 gap-6">
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