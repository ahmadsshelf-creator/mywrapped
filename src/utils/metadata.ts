// Extract audio metadata from files
import jsmediatags from 'jsmediatags';

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
  duration?: number;
  albumArt?: string;
}

export async function extractMetadata(file: File): Promise<AudioMetadata> {
  return new Promise((resolve) => {
    const metadata: AudioMetadata = {};

    jsmediatags.read(file, {
      onSuccess: (tag: any) => {
        const tags = tag.tags;
        metadata.title = tags.title || tags.TIT2 || undefined;
        metadata.artist = tags.artist || tags.TPE1 || undefined;
        metadata.album = tags.album || tags.TALB || undefined;
        metadata.genre = tags.genre || tags.TCON || undefined;
        metadata.year = tags.year ? parseInt(tags.year) : undefined;

        // Extract album art
        if (tags.picture) {
          const picture = tags.picture;
          const base64String = String.fromCharCode.apply(null, Array.from(picture.data));
          const base64 = btoa(base64String);
          metadata.albumArt = `data:${picture.format};base64,${base64}`;
        } else if (tags.APIC) {
          const picture = tags.APIC;
          const base64String = String.fromCharCode.apply(null, Array.from(picture.data));
          const base64 = btoa(base64String);
          metadata.albumArt = `data:${picture.format};base64,${base64}`;
        }

        resolve(metadata);
      },
      onError: () => {
        // If metadata extraction fails, return empty metadata
        resolve(metadata);
      },
    });
  });
}

export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      audio.src = '';
    });
    audio.addEventListener('error', reject);
    audio.src = url;
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'weba'];

export function isSupportedAudioFormat(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_AUDIO_FORMATS.includes(ext);
}
