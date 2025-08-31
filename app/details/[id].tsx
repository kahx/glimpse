import { useVideoStore } from '@/store/videoStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DetailsPage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVideoById, deleteVideo } = useVideoStore();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const video = getVideoById(id!);
  
  // Create video player for the cropped video
  const player = useVideoPlayer(video?.croppedVideoUri || '', player => {
    player.loop = true;
    player.pause(); // Start paused
  });

  // Delete function
  const handleDelete = useCallback(async () => {
    if (!video) return;

    Alert.alert(
      'Delete Moment',
      `Are you sure you want to delete "${video.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteVideo(video.id);
              Alert.alert(
                'Deleted',
                'Moment has been deleted successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to main screen
                      router.replace('/');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Failed to delete video:', error);
              Alert.alert(
                'Error',
                'Failed to delete moment. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [video, deleteVideo]);

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
            player={player}
            nativeControls
            allowsFullscreen
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

          {/* Delete Button */}
          <View className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <Pressable
              onPress={handleDelete}
              disabled={isLoading}
              className={`py-3 rounded-lg border-2 border-red-500 ${
                isLoading ? 'opacity-50' : 'bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons 
                  name="trash-outline" 
                  size={20} 
                  color="#EF4444" 
                  style={{ marginRight: 8 }}
                />
                <Text className="text-red-500 font-semibold text-center">
                  {isLoading ? 'Deleting...' : 'Delete Moment'}
                </Text>
              </View>
            </Pressable>
            <Text className="text-gray-500 dark:text-gray-400 text-xs text-center mt-2">
              This action cannot be undone
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
