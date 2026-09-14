import { useCallback } from 'react'

interface AudioMetadata {
  title?: string
  artist?: string
  album?: string
  duration: number
  albumArt?: string
  genre?: string
  year?: number
}

export const useAudioMetadata = () => {
  const extractMetadata = useCallback(async (file: File | Blob): Promise<AudioMetadata> => {
    const metadata: AudioMetadata = {
      duration: 0,
    }

    // Create a temporary audio element to get duration
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.src = url

    return new Promise((resolve) => {
      const onLoadedMetadata = () => {
        metadata.duration = audio.duration
        URL.revokeObjectURL(url)
        audio.removeEventListener('loadedmetadata', onLoadedMetadata)
        audio.removeEventListener('error', onError)
        resolve(metadata)
      }

      const onError = () => {
        URL.revokeObjectURL(url)
        audio.removeEventListener('loadedmetadata', onLoadedMetadata)
        audio.removeEventListener('error', onError)
        resolve(metadata)
      }

      audio.addEventListener('loadedmetadata', onLoadedMetadata)
      audio.addEventListener('error', onError)
    })
  }, [])

  return { extractMetadata }
}
