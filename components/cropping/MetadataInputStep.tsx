import { CropSelection, SelectedVideo, VideoMetadataForm, VideoMetadataSchema } from '@/types/cropping';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface MetadataInputStepProps {
  selectedVideo: SelectedVideo;
  cropSelection: CropSelection;
  onMetadataSubmit: (metadata: VideoMetadataForm) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function MetadataInputStep({ 
  selectedVideo, 
  cropSelection, 
  onMetadataSubmit, 
  onBack, 
  isLoading 
}: MetadataInputStepProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Partial<VideoMetadataForm>>({});
  const [touched, setTouched] = useState({ name: false, description: false });
  
  // Refs for TextInput components
  const scrollViewRef = useRef<ScrollView>(null);

  const validateField = (fieldName: keyof VideoMetadataForm, value: string) => {
    try {
      if (fieldName === 'name') {
        VideoMetadataSchema.shape.name.parse(value);
      } else if (fieldName === 'description') {
        VideoMetadataSchema.shape.description.parse(value);
      }
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    } catch (error: any) {
      if (error.errors && error.errors[0]) {
        setErrors(prev => ({ ...prev, [fieldName]: error.errors[0].message }));
      }
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (touched.name) {
      validateField('name', text);
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (touched.description) {
      validateField('description', text);
    }
  };

  const handleNameBlur = () => {
    setTouched(prev => ({ ...prev, name: true }));
    validateField('name', name);
  };

  const handleDescriptionBlur = () => {
    setTouched(prev => ({ ...prev, description: true }));
    validateField('description', description);
  };

  const handleNameFocus = () => {
    // Scroll to make name input visible when keyboard appears
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 150, animated: true });
    }, 100);
  };

  const handleDescriptionFocus = () => {
    // Scroll to make description input visible when keyboard appears
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }, 100);
  };



  const handleSubmit = () => {
    // Validate all fields
    const metadata = { name: name.trim(), description: description.trim() };
    
    try {
      const validatedData = VideoMetadataSchema.parse(metadata);
      setErrors({});
      onMetadataSubmit(validatedData);
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Partial<VideoMetadataForm> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof VideoMetadataForm] = err.message;
          }
        });
        setErrors(newErrors);
      }
      
      // Mark all fields as touched to show errors
      setTouched({ name: true, description: true });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isFormValid = name.trim().length > 0 && !errors.name && !errors.description;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      style={{ flex: 1 }}
    >
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-green-100 dark:bg-green-900 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Ionicons 
                name="create" 
                size={40} 
                color="#10B981" 
              />
            </View>
            
            <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-2">
              Add Details
            </Text>
            
            <Text className="text-gray-600 dark:text-gray-400 text-center text-base">
              Give your moment a name and description
            </Text>
          </View>

          {/* Video Summary */}
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
            <Text className="text-gray-900 dark:text-white font-semibold mb-3">
              Video Summary
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Duration</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {cropSelection.duration.toFixed(1)}s
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Segment</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {formatTime(cropSelection.startTime)} - {formatTime(cropSelection.endTime)}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600 dark:text-gray-400">Resolution</Text>
                <Text className="text-gray-900 dark:text-white font-medium">
                  {selectedVideo.width} × {selectedVideo.height}
                </Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View className="space-y-6">
            {/* Name Field */}
            <View>
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={name}
                onChangeText={handleNameChange}
                onBlur={handleNameBlur}
                onFocus={handleNameFocus}
                placeholder="Enter a name for your moment"
                placeholderTextColor="#9CA3AF"
                className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-4 text-gray-900 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                maxLength={100}
                autoCapitalize="words"
                returnKeyType="next"
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.name}
                </Text>
              )}
              <Text className="text-gray-500 text-xs mt-1 ml-1">
                {name.length}/100 characters
              </Text>
            </View>

            {/* Description Field */}
            <View>
              <Text className="text-gray-900 dark:text-white font-semibold mb-2">
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={handleDescriptionChange}
                onBlur={handleDescriptionBlur}
                onFocus={handleDescriptionFocus}
                placeholder="Add a description (optional)"
                placeholderTextColor="#9CA3AF"
                className={`bg-white dark:bg-gray-800 border-2 rounded-xl p-4 text-gray-900 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
                autoCapitalize="sentences"
                returnKeyType="done"
              />
              {errors.description && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.description}
                </Text>
              )}
              <Text className="text-gray-500 text-xs mt-1 ml-1">
                {description.length}/500 characters
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="my-8 space-y-4 gap-6">
            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
              className={`p-4 rounded-xl shadow-sm ${
                isFormValid && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-400'
              }`}
            >
              <Text className="text-white font-semibold text-base text-center">
                {isLoading ? 'Processing Video...' : 'Create Moment'}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={onBack}
              disabled={isLoading}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 disabled:bg-gray-400 p-4 rounded-xl"
            >
              <Text className="text-gray-800 dark:text-gray-200 font-medium text-base text-center">
                Back to Cropping
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
