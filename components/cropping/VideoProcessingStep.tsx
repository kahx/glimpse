import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

interface VideoProcessingStepProps {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

export function VideoProcessingStep({
  isProcessing,
  progress,
  error,
  onRetry,
  onCancel
}: VideoProcessingStepProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isProcessing) {
      // Rotation animation for processing spinner
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      
      // Subtle scale animation
      scale.value = withRepeat(
        withTiming(1.1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      rotation.value = 0;
      scale.value = 1;
    }
  }, [isProcessing, rotation, scale]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress * 100, 5)}%`,
  }));

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-red-100 dark:bg-red-900 w-24 h-24 rounded-full items-center justify-center mb-8">
          <Ionicons 
            name="alert-circle" 
            size={40} 
            color="#EF4444" 
          />
        </View>
        
        <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-3">
          Processing Failed
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-2">
          We encountered an error while processing your video:
        </Text>
        
        <Text className="text-red-600 dark:text-red-400 text-center text-sm leading-5 mb-8 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </Text>

        <View className="w-full max-w-sm space-y-4">
          <Pressable
            onPress={onRetry}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 p-4 rounded-xl shadow-sm"
          >
            <Text className="text-white font-semibold text-base text-center">
              Try Again
            </Text>
          </Pressable>
          
          <Pressable
            onPress={onCancel}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 p-4 rounded-xl"
          >
            <Text className="text-gray-800 dark:text-gray-200 font-medium text-base text-center">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!isProcessing && progress >= 1) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-green-100 dark:bg-green-900 w-24 h-24 rounded-full items-center justify-center mb-8">
          <Ionicons 
            name="checkmark-circle" 
            size={40} 
            color="#10B981" 
          />
        </View>
        
        <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-3">
          Video Ready!
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-8">
          Your moment has been successfully created and saved.
        </Text>
        
        <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <Text className="text-green-700 dark:text-green-300 text-center text-sm">
            ✓ Video cropped and processed
            {'\n'}✓ Metadata saved
            {'\n'}✓ Added to your diary collection
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Animated.View 
        className="bg-blue-100 dark:bg-blue-900 w-24 h-24 rounded-full items-center justify-center mb-8"
        style={animatedIconStyle}
      >
        <Ionicons 
          name="cog" 
          size={40} 
          color="#3B82F6" 
        />
      </Animated.View>
      
      <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-3">
        Processing Video
      </Text>
      
      <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-8">
        We&apos;re cropping your video and preparing your moment. This may take a moment...
      </Text>

      {/* Progress Bar */}
      <View className="w-full max-w-sm mb-6">
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <Animated.View 
            className="bg-blue-500 h-full rounded-full"
            style={progressBarStyle}
          />
        </View>
        <Text className="text-gray-600 dark:text-gray-400 text-center text-sm mt-2">
          {Math.round(progress * 100)}% complete
        </Text>
      </View>

      {/* Processing Steps */}
      <View className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
        <Text className="text-gray-900 dark:text-white font-semibold mb-4 text-center">
          Processing Steps
        </Text>
        
        <View className="space-y-3">
          <ProcessingStep 
            label="Analyzing video file"
            isActive={progress < 0.2}
            isComplete={progress >= 0.2}
          />
          <ProcessingStep 
            label="Cropping video segment"
            isActive={progress >= 0.2 && progress < 0.8}
            isComplete={progress >= 0.8}
          />
          <ProcessingStep 
            label="Verifying and saving"
            isActive={progress >= 0.8 && progress < 1}
            isComplete={progress >= 1}
          />
        </View>
      </View>

      <Pressable
        onPress={onCancel}
        className="mt-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-gray-800 dark:text-gray-200 font-medium text-base">
          Cancel Processing
        </Text>
      </Pressable>
    </View>
  );
}

interface ProcessingStepProps {
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

function ProcessingStep({ label, isActive, isComplete }: ProcessingStepProps) {
  return (
    <View className="flex-row items-center">
      <View className={`w-4 h-4 rounded-full mr-3 ${
        isComplete 
          ? 'bg-green-500' 
          : isActive 
            ? 'bg-blue-500' 
            : 'bg-gray-300 dark:bg-gray-600'
      }`}>
        {isComplete && (
          <View className="items-center justify-center flex-1">
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        )}
      </View>
      <Text className={`text-sm ${
        isComplete 
          ? 'text-green-600 dark:text-green-400' 
          : isActive 
            ? 'text-blue-600 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400'
      }`}>
        {label}
      </Text>
    </View>
  );
}
