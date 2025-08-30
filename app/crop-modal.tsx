import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CropModal() {
  const insets = useSafeAreaInsets();

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
            <Ionicons name="close" size={24} color="#3B82F6" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            Create Video Diary Entry
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-8">
        <View className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full items-center justify-center mb-6">
          <Ionicons 
            name="videocam" 
            size={40} 
            color="#3B82F6" 
          />
        </View>
        
        <Text className="text-gray-900 dark:text-white text-xl font-semibold text-center mb-3">
          Crop Modal Coming Soon
        </Text>
        
        <Text className="text-gray-600 dark:text-gray-400 text-center text-base leading-6 mb-8">
          This will implement the 3-step video cropping process: video selection, cropping interface, and metadata input.
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
