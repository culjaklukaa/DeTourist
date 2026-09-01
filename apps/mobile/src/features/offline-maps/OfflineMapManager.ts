import { Paths, Directory, File, DownloadTask } from 'expo-file-system';

export interface MapRegion {
  id: string;
  name: string;
  download_url: string;
  size_bytes: number;
  bounds: number[];
}

export class OfflineMapManager {
  private static getDirectory(): Directory {
    const dir = new Directory(Paths.document, 'offline-maps');
    // We assume the directory creation can be handled or isn't strictly necessary 
    // before instantiating a File object within it, but we can call create()
    dir.create();
    return dir;
  }

  static getLocalFile(regionId: string): File {
    return new File(this.getDirectory(), `${regionId}.pmtiles`);
  }

  static getLocalUri(regionId: string): string {
    return this.getLocalFile(regionId).uri;
  }

  static isRegionDownloaded(regionId: string): boolean {
    return this.getLocalFile(regionId).exists;
  }

  static async downloadRegion(region: MapRegion, onProgress?: (progress: number) => void): Promise<string> {
    const file = this.getLocalFile(region.id);
    
    // We can use createDownloadTask for progress updates
    const task = File.createDownloadTask(region.download_url, file, {
      onProgress: ({ bytesWritten, totalBytes }) => {
        if (onProgress && totalBytes > 0) {
          onProgress(bytesWritten / totalBytes);
        }
      }
    });

    try {
      const downloadedFile = await task.downloadAsync();
      if (!downloadedFile) {
        throw new Error('Download returned null result');
      }
      return downloadedFile.uri;
    } catch (e) {
      console.error(`Error downloading region ${region.id}:`, e);
      throw e;
    }
  }

  static async deleteRegion(regionId: string): Promise<void> {
    const file = this.getLocalFile(regionId);
    if (file.exists) {
      file.delete();
    }
  }
}
