import { CroppedVideo } from '@/types/video';
import * as SQLite from 'expo-sqlite';

// Database configuration
const DATABASE_NAME = 'glimpse_video_diary.db';
const DATABASE_VERSION = 1;

// SQL statements
const CREATE_VIDEOS_TABLE = `
  CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    original_video_uri TEXT NOT NULL,
    cropped_video_uri TEXT NOT NULL,
    start_time REAL NOT NULL,
    end_time REAL NOT NULL,
    created_at TEXT NOT NULL,
    thumbnail TEXT
  );
`;

const CREATE_INDEX_CREATED_AT = `
  CREATE INDEX IF NOT EXISTS idx_videos_created_at 
  ON videos(created_at DESC);
`;

const CREATE_INDEX_NAME = `
  CREATE INDEX IF NOT EXISTS idx_videos_name 
  ON videos(name);
`;

class VideoDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      // Enable foreign key constraints
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Create tables and indexes
      await this.db.execAsync(CREATE_VIDEOS_TABLE);
      await this.db.execAsync(CREATE_INDEX_CREATED_AT);
      await this.db.execAsync(CREATE_INDEX_NAME);
      
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  async insertVideo(video: CroppedVideo): Promise<void> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        INSERT INTO videos 
        (id, name, description, original_video_uri, cropped_video_uri, start_time, end_time, created_at, thumbnail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await statement.executeAsync([
        video.id,
        video.name,
        video.description || null,
        video.originalVideoUri,
        video.croppedVideoUri,
        video.startTime,
        video.endTime,
        video.createdAt.toISOString(),
        video.thumbnail || null
      ]);

      await statement.finalizeAsync();
      console.log('Video inserted successfully:', video.id);
    } catch (error) {
      console.error('Failed to insert video:', error);
      throw error;
    }
  }

  async getAllVideos(): Promise<CroppedVideo[]> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        SELECT * FROM videos 
        ORDER BY created_at DESC
      `);

      const result = await statement.executeAsync();
      const videos: CroppedVideo[] = [];

      for await (const row of result) {
        videos.push({
          id: row.id as string,
          name: row.name as string,
          description: (row.description as string) || '',
          originalVideoUri: row.original_video_uri as string,
          croppedVideoUri: row.cropped_video_uri as string,
          startTime: row.start_time as number,
          endTime: row.end_time as number,
          createdAt: new Date(row.created_at as string),
          thumbnail: (row.thumbnail as string) || undefined
        });
      }

      await statement.finalizeAsync();
      return videos;
    } catch (error) {
      console.error('Failed to get all videos:', error);
      throw error;
    }
  }

  async getVideoById(id: string): Promise<CroppedVideo | null> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        SELECT * FROM videos WHERE id = ? LIMIT 1
      `);

      const result = await statement.executeAsync([id]);
      const row = await result.getFirstAsync();

      await statement.finalizeAsync();

      if (!row) return null;

      return {
        id: row.id as string,
        name: row.name as string,
        description: (row.description as string) || '',
        originalVideoUri: row.original_video_uri as string,
        croppedVideoUri: row.cropped_video_uri as string,
        startTime: row.start_time as number,
        endTime: row.end_time as number,
        createdAt: new Date(row.created_at as string),
        thumbnail: (row.thumbnail as string) || undefined
      };
    } catch (error) {
      console.error('Failed to get video by ID:', error);
      throw error;
    }
  }

  async updateVideo(id: string, updates: Partial<Omit<CroppedVideo, 'id' | 'createdAt'>>): Promise<void> {
    this.ensureInitialized();
    
    try {
      const setClause: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        setClause.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClause.push('description = ?');
        values.push(updates.description);
      }
      if (updates.originalVideoUri !== undefined) {
        setClause.push('original_video_uri = ?');
        values.push(updates.originalVideoUri);
      }
      if (updates.croppedVideoUri !== undefined) {
        setClause.push('cropped_video_uri = ?');
        values.push(updates.croppedVideoUri);
      }
      if (updates.startTime !== undefined) {
        setClause.push('start_time = ?');
        values.push(updates.startTime);
      }
      if (updates.endTime !== undefined) {
        setClause.push('end_time = ?');
        values.push(updates.endTime);
      }
      if (updates.thumbnail !== undefined) {
        setClause.push('thumbnail = ?');
        values.push(updates.thumbnail);
      }

      if (setClause.length === 0) {
        console.log('No updates provided for video:', id);
        return;
      }

      values.push(id);

      const statement = await this.db!.prepareAsync(`
        UPDATE videos SET ${setClause.join(', ')} WHERE id = ?
      `);

      await statement.executeAsync(values);
      await statement.finalizeAsync();
      
      console.log('Video updated successfully:', id);
    } catch (error) {
      console.error('Failed to update video:', error);
      throw error;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        DELETE FROM videos WHERE id = ?
      `);

      await statement.executeAsync([id]);
      await statement.finalizeAsync();
      
      console.log('Video deleted successfully:', id);
    } catch (error) {
      console.error('Failed to delete video:', error);
      throw error;
    }
  }

  async getVideoCount(): Promise<number> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        SELECT COUNT(*) as count FROM videos
      `);

      const result = await statement.executeAsync();
      const row = await result.getFirstAsync();
      
      await statement.finalizeAsync();

      return (row?.count as number) || 0;
    } catch (error) {
      console.error('Failed to get video count:', error);
      throw error;
    }
  }

  async searchVideos(query: string): Promise<CroppedVideo[]> {
    this.ensureInitialized();
    
    try {
      const statement = await this.db!.prepareAsync(`
        SELECT * FROM videos 
        WHERE name LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
      `);

      const searchPattern = `%${query}%`;
      const result = await statement.executeAsync([searchPattern, searchPattern]);
      const videos: CroppedVideo[] = [];

      for await (const row of result) {
        videos.push({
          id: row.id as string,
          name: row.name as string,
          description: (row.description as string) || '',
          originalVideoUri: row.original_video_uri as string,
          croppedVideoUri: row.cropped_video_uri as string,
          startTime: row.start_time as number,
          endTime: row.end_time as number,
          createdAt: new Date(row.created_at as string),
          thumbnail: (row.thumbnail as string) || undefined
        });
      }

      await statement.finalizeAsync();
      return videos;
    } catch (error) {
      console.error('Failed to search videos:', error);
      throw error;
    }
  }

  async clearAllVideos(): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.db!.execAsync('DELETE FROM videos');
      console.log('All videos cleared from database');
    } catch (error) {
      console.error('Failed to clear all videos:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('Database connection closed');
    }
  }
}

// Export singleton instance
export const videoDatabase = new VideoDatabase();
