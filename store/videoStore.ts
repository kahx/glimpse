import { CroppedVideo } from '@/types/video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VideoStore {
  // State
  croppedVideos: CroppedVideo[];
  isLoading: boolean;
  
  // Actions
  addCroppedVideo: (video: CroppedVideo) => void;
  updateVideo: (id: string, updates: Partial<CroppedVideo>) => void;
  deleteVideo: (id: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Getters
  getVideoById: (id: string) => CroppedVideo | undefined;
  getVideoCount: () => number;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set, get) => ({
      // Initial state
      croppedVideos: [],
      isLoading: false,
      
      // Actions
      addCroppedVideo: (video: CroppedVideo) => {
        console.log('Adding cropped video to store:', video);
        
        // Ensure createdAt is a proper Date object before storing
        const videoWithValidDate = {
          ...video,
          createdAt: video.createdAt instanceof Date ? video.createdAt : new Date(video.createdAt || Date.now())
        };
        
        set((state) => {
          const newState = {
            croppedVideos: [videoWithValidDate, ...state.croppedVideos]
          };
          console.log('Updated video store state:', {
            totalVideos: newState.croppedVideos.length,
            newVideoId: video.id,
            createdAt: videoWithValidDate.createdAt.toISOString()
          });
          return newState;
        });
      },
      
      updateVideo: (id: string, updates: Partial<CroppedVideo>) =>
        set((state) => ({
          croppedVideos: state.croppedVideos.map((video) =>
            video.id === id ? { ...video, ...updates } : video
          )
        })),
      
      deleteVideo: (id: string) =>
        set((state) => ({
          croppedVideos: state.croppedVideos.filter((video) => video.id !== id)
        })),
      
      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
      
      // Getters
      getVideoById: (id: string) => {
        const state = get();
        return state.croppedVideos.find((video) => video.id === id);
      },
      
      getVideoCount: () => {
        const state = get();
        return state.croppedVideos.length;
      }
    }),
    {
      name: 'video-diary-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
