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
      addCroppedVideo: (video: CroppedVideo) => 
        set((state) => ({
          croppedVideos: [video, ...state.croppedVideos]
        })),
      
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
      // Custom serialization for Date objects
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        if (parsed.state?.croppedVideos) {
          parsed.state.croppedVideos = parsed.state.croppedVideos.map((video: any) => ({
            ...video,
            createdAt: new Date(video.createdAt)
          }));
        }
        return parsed;
      }
    }
  )
);
