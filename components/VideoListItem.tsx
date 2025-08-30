import { CroppedVideo } from '@/types/video';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface VideoListItemProps {
  video: CroppedVideo;
  onPress: () => void;
}

export function VideoListItem({ video, onPress }: VideoListItemProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = () => {
    const duration = video.endTime - video.startTime;
    return `${duration.toFixed(1)}s`;
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white dark:bg-gray-800 p-4 mx-4 mb-3 rounded-xl shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* Video Thumbnail */}
      <View className="relative mr-4">
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700"
            contentFit="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
            <Ionicons 
              name="videocam" 
              size={24} 
              color="#9CA3AF" 
            />
          </View>
        )}
        
        {/* Duration Badge */}
        <View className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded">
          <Text className="text-white text-xs font-medium">
            {formatDuration()}
          </Text>
        </View>
        
        {/* Play Icon Overlay */}
        <View className="absolute inset-0 items-center justify-center">
          <View className="bg-black/40 rounded-full p-1.5">
            <Ionicons 
              name="play" 
              size={16} 
              color="white" 
            />
          </View>
        </View>
      </View>

      {/* Video Info */}
      <View className="flex-1">
        <Text 
          className="text-gray-900 dark:text-white font-semibold text-base mb-1"
          numberOfLines={2}
        >
          {video.name}
        </Text>
        
        {video.description && (
          <Text 
            className="text-gray-600 dark:text-gray-400 text-sm mb-2"
            numberOfLines={2}
          >
            {video.description}
          </Text>
        )}
        
        <Text className="text-gray-500 dark:text-gray-500 text-xs">
          {formatDate(video.createdAt)}
        </Text>
      </View>

      {/* Arrow Icon */}
      <View className="ml-2">
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#9CA3AF" 
        />
      </View>
    </Pressable>
  );
}
