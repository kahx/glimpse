import { videoDatabase } from '@/database/videoDatabase';
import { CroppedVideo } from '@/types/video';
import { create } from 'zustand';

interface VideoStore {
  // State
  croppedVideos: CroppedVideo[];
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  addCroppedVideo: (video: CroppedVideo) => Promise<void>;
  updateVideo: (id: string, updates: Partial<CroppedVideo>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  refreshVideos: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  searchVideos: (query: string) => Promise<CroppedVideo[]>;
  
  // Getters
  getVideoById: (id: string) => CroppedVideo | undefined;
  getVideoCount: () => number;
}

export const useVideoStore = create<VideoStore>()((set, get) => ({
  // Initial state
  croppedVideos: [],
  isLoading: false,
  isInitialized: false,
  
  // Actions
  initialize: async () => {
    const state = get();
    if (state.isInitialized) return;
    
    try {
      set({ isLoading: true });
      
      // Initialize database
      await videoDatabase.initialize();
      
      // Load videos from SQLite
      const videos = await videoDatabase.getAllVideos();
      
      set({ 
        croppedVideos: videos,
        isInitialized: true,
        isLoading: false 
      });
      
      console.log(`Video store initialized with ${videos.length} videos`);
    } catch (error) {
      console.error('Failed to initialize video store:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  addCroppedVideo: async (video: CroppedVideo) => {
    try {
      console.log('Adding cropped video to store:', video);
      
      // Ensure createdAt is a proper Date object
      const videoWithValidDate = {
        ...video,
        createdAt: video.createdAt instanceof Date ? video.createdAt : new Date(video.createdAt || Date.now())
      };
      
      // Save to SQLite
      await videoDatabase.insertVideo(videoWithValidDate);
      
      // Update local state
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
    } catch (error) {
      console.error('Failed to add video to store:', error);
      throw error;
    }
  },
  
  updateVideo: async (id: string, updates: Partial<CroppedVideo>) => {
    try {
      // Update in SQLite
      await videoDatabase.updateVideo(id, updates);
      
      // Update local state
      set((state) => ({
        croppedVideos: state.croppedVideos.map((video) =>
          video.id === id ? { ...video, ...updates } : video
        )
      }));
      
      console.log('Video updated successfully:', id);
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  },
  
  deleteVideo: async (id: string) => {
    try {
      // Delete from SQLite
      await videoDatabase.deleteVideo(id);
      
      // Update local state
      set((state) => ({
        croppedVideos: state.croppedVideos.filter((video) => video.id !== id)
      }));
      
      console.log('Video deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  },
  
  refreshVideos: async () => {
    try {
      set({ isLoading: true });
      const videos = await videoDatabase.getAllVideos();
      set({ 
        croppedVideos: videos,
        isLoading: false 
      });
      console.log(`Refreshed ${videos.length} videos from database`);
    } catch (error) {
      console.error('Failed to refresh videos:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  searchVideos: async (query: string) => {
    try {
      const videos = await videoDatabase.searchVideos(query);
      console.log(`Search for "${query}" returned ${videos.length} results`);
      return videos;
    } catch (error) {
      console.error('Failed to search videos:', error);
      throw error;
    }
  },
  
  // Getters
  getVideoById: (id: string) => {
    const state = get();
    return state.croppedVideos.find((video) => video.id === id);
  },
  
  getVideoCount: () => {
    const state = get();
    return state.croppedVideos.length;
  }
}));
