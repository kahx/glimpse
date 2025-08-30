import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface EmptyVideoListProps {
  onAddPress: () => void;
}

export function EmptyVideoList({ onAddPress }: EmptyVideoListProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full items-center justify-center mb-6">
        <Ionicons 
          name="videocam-outline" 
          size={40} 
          color="#9CA3AF" 
        />
      </View>
      
      <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
        No video diary entries yet
      </Text>
      
      <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-8">
        Create your first video diary entry by importing a video and cropping a 5-second moment.
      </Text>
      
      <Pressable
          onPress={onAddPress}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-6 py-3 rounded-full shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Add Your First Entry
          </Text>
        </Pressable>
    </View>
  );
}
