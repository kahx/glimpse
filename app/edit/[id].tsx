import { useVideoStore } from '@/store/videoStore';
import { VideoMetadataSchema } from '@/types/cropping';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditPage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVideoById, updateVideo } = useVideoStore();
  
  const video = getVideoById(id!);
  
  // Form state
  const [name, setName] = useState(video?.name || '');
  const [description, setDescription] = useState(video?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  // Validation function using Zod
  const validateForm = useCallback(() => {
    const result = VideoMetadataSchema.safeParse({
      name,
      description
    });
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const fieldErrors: { name?: string; description?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field === 'name' || field === 'description') {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  }, [name, description]);

  // Save function
  const handleSave = useCallback(async () => {
    if (!video || !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateVideo(video.id, {
        name: name.trim(),
        description: description.trim()
      });
      
      Alert.alert(
        'Success',
        'Video details updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update video:', error);
      Alert.alert(
        'Error',
        'Failed to update video details. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [video, name, description, updateVideo, validateForm]);

  // Real-time validation effect
  useEffect(() => {
    // Only validate if user has started typing
    if (name !== video?.name || description !== video?.description) {
      const result = VideoMetadataSchema.safeParse({
        name,
        description
      });
      
      if (result.success) {
        setErrors({});
      } else {
        const fieldErrors: { name?: string; description?: string } = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (field === 'name' || field === 'description') {
            fieldErrors[field] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  }, [name, description, video?.name, video?.description]);

  // Check if form has changes
  const hasChanges = useCallback(() => {
    return name.trim() !== video?.name || description.trim() !== video?.description;
  }, [name, description, video]);

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
            Edit Moment
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      >
        {/* Form Content */}
        <View className="p-6">
          {/* Name Input */}
          <View className="mb-6">
            <Text className="text-gray-900 dark:text-white font-semibold mb-3">
              Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter video name"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-base"
              style={{
                borderColor: errors.name ? '#EF4444' : undefined,
                borderWidth: errors.name ? 2 : 1
              }}
              maxLength={100}
              autoCapitalize="sentences"
              autoCorrect
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-2">{errors.name}</Text>
            )}
            <Text className="text-gray-500 text-xs mt-1">
              {name.length}/100 characters
            </Text>
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-gray-900 dark:text-white font-semibold mb-3">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter video description (optional)"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-base"
              style={{
                borderColor: errors.description ? '#EF4444' : undefined,
                borderWidth: errors.description ? 2 : 1,
                minHeight: 100,
                textAlignVertical: 'top'
              }}
              maxLength={500}
              multiline
              numberOfLines={4}
              autoCapitalize="sentences"
              autoCorrect
            />
            {errors.description && (
              <Text className="text-red-500 text-sm mt-2">{errors.description}</Text>
            )}
            <Text className="text-gray-500 text-xs mt-1">
              {description.length}/500 characters
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 gap-6">
            <Pressable
              onPress={() => router.back()}
              className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg"
              disabled={isLoading}
            >
              <Text className="text-gray-800 dark:text-gray-200 font-semibold text-center">
                Cancel
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleSave}
              disabled={isLoading || !hasChanges()}
              className={`flex-1 py-3 rounded-lg ${
                !hasChanges() || isLoading 
                  ? 'bg-gray-300 dark:bg-gray-600' 
                  : 'bg-blue-500 dark:bg-blue-600'
              }`}
            >
              <Text className={`font-semibold text-center ${
                !hasChanges() || isLoading 
                  ? 'text-gray-500 dark:text-gray-400' 
                  : 'text-white'
              }`}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
