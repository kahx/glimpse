import { CROP_CONSTANTS, SelectedVideo } from '@/types/cropping';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

interface VideoSelectionStepProps {
  onVideoSelected: (video: SelectedVideo) => void;
  isLoading: boolean;
}

export function VideoSelectionStep({ onVideoSelected, isLoading }: VideoSelectionStepProps) {
  const [isSelectingVideo, setIsSelectingVideo] = useState(false);
  const validateVideo = (asset: ImagePicker.ImagePickerAsset): SelectedVideo | null => {
    // Check file size
    if (asset.fileSize && asset.fileSize > CROP_CONSTANTS.MAX_FILE_SIZE) {
      Alert.alert(
        'File Too Large',
        'Please select a video smaller than 100MB.',
        [{ text: 'OK' }]
      );
      return null;
    }

    // Check duration (must be at least 5 seconds)
    // expo-image-picker returns duration in milliseconds, convert to seconds
    const durationInSeconds = asset.duration ? asset.duration / 1000 : 0;

    if (!asset.duration || durationInSeconds < CROP_CONSTANTS.REQUIRED_DURATION) {
      Alert.alert(
        'Video Too Short',
        `Please select a video that is at least ${CROP_CONSTANTS.REQUIRED_DURATION} seconds long. Your video is ${durationInSeconds.toFixed(1)} seconds.`,
        [{ text: 'OK' }]
      );
      return null;
    }

    // Check format
    if (asset.mimeType && !CROP_CONSTANTS.SUPPORTED_FORMATS.includes(asset.mimeType as any)) {
      Alert.alert(
        'Unsupported Format',
        'Please select a video in a supported format (MP4, MOV, or AVI).',
        [{ text: 'OK' }]
      );
      return null;
    }

    return {
      uri: asset.uri,
      duration: durationInSeconds, // Store duration in seconds for consistency
      width: asset.width || 0,
      height: asset.height || 0,
      fileSize: asset.fileSize || 0,
      mimeType: asset.mimeType || '',
    };
  };

  const selectFromGallery = async () => {
    try {
      setIsSelectingVideo(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select videos.',
          [{ text: 'OK' }]
        );
        setIsSelectingVideo(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 300, // 5 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        const validatedVideo = validateVideo(result.assets[0]);
        if (validatedVideo) {
          onVideoSelected(validatedVideo);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to select video. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Video selection error:', error);
    } finally {
      setIsSelectingVideo(false);
    }
  };

  const recordVideo = async () => {
    try {
      setIsSelectingVideo(true);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to record videos.',
          [{ text: 'OK' }]
        );
        setIsSelectingVideo(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 300, // 5 minutes max
      });

      if (!result.canceled && result.assets[0]) {
        const validatedVideo = validateVideo(result.assets[0]);
        if (validatedVideo) {
          onVideoSelected(validatedVideo);
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to record video. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Video recording error:', error);
    } finally {
      setIsSelectingVideo(false);
    }
  };

  const isAnyLoading = isLoading || isSelectingVideo;

  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-blue-100 dark:bg-blue-900 w-24 h-24 rounded-full items-center justify-center mb-8">
        <Ionicons 
          name="videocam" 
          size={40} 
          color="#3B82F6" 
        />
      </View>
      
      <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-3">
        Select a Video
      </Text>
      
      <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-12">
        Choose a video from your gallery or record a new one. The video must be at least 5 seconds long.
      </Text>

      {isSelectingVideo && (
        <View className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex-row items-center">
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 12 }} />
          <Text className="text-blue-600 dark:text-blue-400 font-medium">
            Processing video...
          </Text>
        </View>
      )}

      <View className="w-full max-w-sm space-y-4 gap-6">
        <Pressable
          onPress={selectFromGallery}
          disabled={isAnyLoading}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 p-4 rounded-xl shadow-sm flex-row items-center justify-center"
        >
          {isSelectingVideo ? (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons 
              name="images" 
              size={20} 
              color="white" 
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-white font-semibold text-base">
            {isSelectingVideo ? 'Processing...' : isLoading ? 'Loading...' : 'Choose from Gallery'}
          </Text>
        </Pressable>

        <Pressable
          onPress={recordVideo}
          disabled={isAnyLoading}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 disabled:bg-gray-400 p-4 rounded-xl shadow-sm flex-row items-center justify-center"
        >
          {isSelectingVideo ? (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons 
              name="camera" 
              size={20} 
              color="white" 
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-white font-semibold text-base">
            {isSelectingVideo ? 'Processing...' : isLoading ? 'Loading...' : 'Record New Video'}
          </Text>
        </Pressable>
      </View>

      <View className="mt-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <Text className="text-gray-700 dark:text-gray-300 text-sm text-center">
          <Text className="font-semibold">Requirements:</Text>
          {'\n'}• At least 5 seconds long
          {'\n'}• MP4, MOV, or AVI format
          {'\n'}• Maximum 100MB file size
        </Text>
      </View>
    </View>
  );
}
