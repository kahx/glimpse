import { useVideoStore } from '@/store/videoStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView } from 'expo-video';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DetailsPage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVideoById } = useVideoStore();
  
  const video = getVideoById(id!);

  if (!video) {
    return (
      <View 
        className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-gray-600 dark:text-gray-400 text-lg">
          Video not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const formatDate = (date: Date | string | number) => {
    try {
      // Ensure we have a valid Date object
      const validDate = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(validDate.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }).format(validDate);
    } catch (error) {
      console.warn('Error formatting date in details page:', error, 'Date value:', date);
      return 'Invalid date';
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${video.id}`);
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
            onPress={() => router.back()}
            className="mr-4 p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            Video Details
          </Text>
          
          <Pressable
            onPress={handleEdit}
            className="p-2 -mr-2"
          >
            <Ionicons name="create-outline" size={24} color="#3B82F6" />
          </Pressable>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Video Player */}
        <View className="bg-black mx-4 mt-6 rounded-xl overflow-hidden">
          <VideoView
            style={{ width: '100%', aspectRatio: 16/9 }}
            source={{ uri: video.croppedVideoUri }}
            useNativeControls
            shouldPlay={false}
            isLooping
          />
        </View>

        {/* Video Info */}
        <View className="p-6">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {video.name}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Created {formatDate(video.createdAt)}
            </Text>
          </View>

          {video.description && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </Text>
              <Text className="text-gray-700 dark:text-gray-300 leading-6">
                {video.description}
              </Text>
            </View>
          )}

          {/* Video Details */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Video Details
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Duration</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {(video.endTime - video.startTime).toFixed(1)}s
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Start Time</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {video.startTime.toFixed(1)}s
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">End Time</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {video.endTime.toFixed(1)}s
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
