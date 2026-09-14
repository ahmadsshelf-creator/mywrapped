import { useCallback, useEffect, useState } from 'react'
import { Song, Playlist, ListeningSession, Badge } from '../types'

const DB_NAME = 'MyWrappedDB'
const DB_VERSION = 1

const STORES = {
  songs: 'songs',
  playlists: 'playlists',
  sessions: 'sessions',
  badges: 'badges',
  settings: 'settings',
}

let db: IDBDatabase | null = null

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result

      if (!idb.objectStoreNames.contains(STORES.songs)) {
        const songStore = idb.createObjectStore(STORES.songs, { keyPath: 'id' })
        songStore.createIndex('dateAdded', 'dateAdded', { unique: false })
        songStore.createIndex('artist', 'artist', { unique: false })
        songStore.createIndex('title', 'title', { unique: false })
      }

      if (!idb.objectStoreNames.contains(STORES.playlists)) {
        idb.createObjectStore(STORES.playlists, { keyPath: 'id' })
      }

      if (!idb.objectStoreNames.contains(STORES.sessions)) {
        const sessionStore = idb.createObjectStore(STORES.sessions, { keyPath: 'id' })
        sessionStore.createIndex('songId', 'songId', { unique: false })
        sessionStore.createIndex('playedAt', 'playedAt', { unique: false })
      }

      if (!idb.objectStoreNames.contains(STORES.badges)) {
        idb.createObjectStore(STORES.badges, { keyPath: 'id' })
      }

      if (!idb.objectStoreNames.contains(STORES.settings)) {
        idb.createObjectStore(STORES.settings, { keyPath: 'key' })
      }
    }
  })
}

export const useIndexedDB = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initDB().then(() => setIsReady(true))
  }, [])

  // Songs
  const addSong = useCallback(async (song: Song) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.songs, 'readwrite')
      const store = tx.objectStore(STORES.songs)
      const request = store.add(song)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const updateSong = useCallback(async (song: Song) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.songs, 'readwrite')
      const store = tx.objectStore(STORES.songs)
      const request = store.put(song)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const deleteSong = useCallback(async (id: string) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.songs, 'readwrite')
      const store = tx.objectStore(STORES.songs)
      const request = store.delete(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const getSong = useCallback(async (id: string) => {
    const idb = await initDB()
    return new Promise<Song | undefined>((resolve, reject) => {
      const tx = idb.transaction(STORES.songs, 'readonly')
      const store = tx.objectStore(STORES.songs)
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }, [])

  const getAllSongs = useCallback(async () => {
    const idb = await initDB()
    return new Promise<Song[]>((resolve, reject) => {
      const tx = idb.transaction(STORES.songs, 'readonly')
      const store = tx.objectStore(STORES.songs)
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }, [])

  // Playlists
  const addPlaylist = useCallback(async (playlist: Playlist) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.playlists, 'readwrite')
      const store = tx.objectStore(STORES.playlists)
      const request = store.add(playlist)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const updatePlaylist = useCallback(async (playlist: Playlist) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.playlists, 'readwrite')
      const store = tx.objectStore(STORES.playlists)
      const request = store.put(playlist)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const deletePlaylist = useCallback(async (id: string) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.playlists, 'readwrite')
      const store = tx.objectStore(STORES.playlists)
      const request = store.delete(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const getPlaylist = useCallback(async (id: string) => {
    const idb = await initDB()
    return new Promise<Playlist | undefined>((resolve, reject) => {
      const tx = idb.transaction(STORES.playlists, 'readonly')
      const store = tx.objectStore(STORES.playlists)
      const request = store.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }, [])

  const getAllPlaylists = useCallback(async () => {
    const idb = await initDB()
    return new Promise<Playlist[]>((resolve, reject) => {
      const tx = idb.transaction(STORES.playlists, 'readonly')
      const store = tx.objectStore(STORES.playlists)
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }, [])

  // Sessions
  const addSession = useCallback(async (session: ListeningSession) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.sessions, 'readwrite')
      const store = tx.objectStore(STORES.sessions)
      const request = store.add(session)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const getSessions = useCallback(
    async (filter?: { songId?: string; startDate?: number; endDate?: number }) => {
      const idb = await initDB()
      return new Promise<ListeningSession[]>((resolve, reject) => {
        const tx = idb.transaction(STORES.sessions, 'readonly')
        const store = tx.objectStore(STORES.sessions)
        let request: IDBRequest

        if (filter?.songId) {
          const index = store.index('songId')
          request = index.getAll(filter.songId)
        } else {
          request = store.getAll()
        }

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          let results = request.result
          if (filter?.startDate || filter?.endDate) {
            results = results.filter(
              (s) =>
                (!filter.startDate || s.playedAt >= filter.startDate) &&
                (!filter.endDate || s.playedAt <= filter.endDate)
            )
          }
          resolve(results)
        }
      })
    },
    []
  )

  // Badges
  const addBadge = useCallback(async (badge: Badge) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.badges, 'readwrite')
      const store = tx.objectStore(STORES.badges)
      const request = store.add(badge)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const updateBadge = useCallback(async (badge: Badge) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.badges, 'readwrite')
      const store = tx.objectStore(STORES.badges)
      const request = store.put(badge)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const getAllBadges = useCallback(async () => {
    const idb = await initDB()
    return new Promise<Badge[]>((resolve, reject) => {
      const tx = idb.transaction(STORES.badges, 'readonly')
      const store = tx.objectStore(STORES.badges)
      const request = store.getAll()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }, [])

  // Settings
  const setSetting = useCallback(async (key: string, value: any) => {
    const idb = await initDB()
    return new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(STORES.settings, 'readwrite')
      const store = tx.objectStore(STORES.settings)
      const request = store.put({ key, value })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }, [])

  const getSetting = useCallback(async (key: string) => {
    const idb = await initDB()
    return new Promise<any>((resolve, reject) => {
      const tx = idb.transaction(STORES.settings, 'readonly')
      const store = tx.objectStore(STORES.settings)
      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result?.value)
    })
  }, [])

  return {
    isReady,
    songs: { add: addSong, update: updateSong, delete: deleteSong, get: getSong, getAll: getAllSongs },
    playlists: { add: addPlaylist, update: updatePlaylist, delete: deletePlaylist, get: getPlaylist, getAll: getAllPlaylists },
    sessions: { add: addSession, get: getSessions },
    badges: { add: addBadge, update: updateBadge, getAll: getAllBadges },
    settings: { set: setSetting, get: getSetting },
  }
}
