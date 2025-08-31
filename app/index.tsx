import { EmptyVideoList } from '@/components/EmptyVideoList';
import { VideoListItem } from '@/components/VideoListItem';
import { useVideoStore } from '@/store/videoStore';
import { CroppedVideo } from '@/types/video';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { croppedVideos, isInitialized, initialize, refreshVideos } = useVideoStore();
  const [refreshing, setRefreshing] = useState(false);

  // Initialize the store when the component mounts
  useEffect(() => {
    if (!isInitialized) {
      initialize().catch((error) => {
        console.error('Failed to initialize video store:', error);
      });
    }
  }, [isInitialized, initialize]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshVideos();
    } catch (error) {
      console.error('Failed to refresh videos:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshVideos]);

  const handleVideoPress = useCallback((video: CroppedVideo) => {
    router.push(`/details/${video.id}`);
  }, []);

  const handleAddNewEntry = useCallback(() => {
    router.push('/crop-modal');
  }, []);

  const renderVideoItem = useCallback(({ item }: { item: CroppedVideo }) => (
    <VideoListItem
      video={item}
      onPress={() => handleVideoPress(item)}
    />
  ), [handleVideoPress]);

  const keyExtractor = useCallback((item: CroppedVideo) => item.id, []);

  return (
    <View 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              glimpse.
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {croppedVideos.length === 0 
                ? 'catch your moments' 
                : `${croppedVideos.length} ${croppedVideos.length === 1 ? 'moment' : 'moments'}`
              }
            </Text>
          </View>
          <Pressable
            onPress={handleAddNewEntry}
            className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 p-3 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Video List */}
      <FlashList
        data={croppedVideos}
        renderItem={renderVideoItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <EmptyVideoList onAddPress={handleAddNewEntry} />
        }
      />
    </View>
  );
}
