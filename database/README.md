# SQLite Database Implementation for Glimpse Video Diary

## Overview

This implementation provides a robust SQLite-based storage solution for video metadata in the Glimpse Video Diary app, delivering enhanced performance and scalability for managing video diary entries.

## Database Schema

### Videos Table
```sql
CREATE TABLE videos (
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
```

### Indexes
- `idx_videos_created_at`: Optimizes chronological ordering
- `idx_videos_name`: Accelerates name-based searches

## File Structure

```
database/
├── index.ts              # Main exports
├── videoDatabase.ts      # Core database operations
└── README.md            # This documentation

utils/
└── testDatabase.ts      # Testing utilities
```

## Key Components

### 1. VideoDatabase Class (`videoDatabase.ts`)
- Singleton pattern for database management
- Comprehensive CRUD operations
- Error handling and logging
- Connection lifecycle management

### 2. Enhanced VideoStore (`store/videoStore.ts`)
- Async operations for all database interactions
- Automatic initialization
- Local state synchronization with SQLite
- Error handling and recovery

## Usage Examples

### Initialize the Store
```typescript
const { initialize, isInitialized } = useVideoStore();

useEffect(() => {
  if (!isInitialized) {
    initialize().catch(console.error);
  }
}, [isInitialized, initialize]);
```

### Add a Video Entry
```typescript
const { addCroppedVideo } = useVideoStore();

const newVideo: CroppedVideo = {
  id: Date.now().toString(),
  name: 'My Video',
  description: 'A short video diary entry',
  originalVideoUri: 'file:///original.mp4',
  croppedVideoUri: 'file:///cropped.mp4',
  startTime: 0,
  endTime: 5,
  createdAt: new Date()
};

await addCroppedVideo(newVideo);
```

### Search Videos
```typescript
const { searchVideos } = useVideoStore();
const results = await searchVideos('vacation');
```



## Testing

Use the provided testing utilities to verify the implementation:

```typescript
import { performDatabaseHealthCheck } from '@/utils/testDatabase';

// Run comprehensive health check
const results = await performDatabaseHealthCheck();
console.log(results.summary);
```