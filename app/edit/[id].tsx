import { useVideoStore } from '@/store/videoStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditPage() {
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
            Edit Entry
          </Text>
          
          <Pressable
            className="p-2 -mr-2"
          >
            <Text className="text-blue-500 font-semibold">Save</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full items-center justify-center mb-6">
          <Ionicons 
            name="create" 
            size={40} 
            color="#3B82F6" 
          />
        </View>
        
        <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
          Edit Functionality Coming Soon
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-4">
          This will allow editing the name and description of:
        </Text>
        
        <Text className="text-gray-900 dark:text-white font-semibold text-center mb-8">
          "{video.name}"
        </Text>
        
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 px-6 py-3 rounded-full shadow-sm"
        >
          <Text className="text-white font-semibold text-base">
            Go Back
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
