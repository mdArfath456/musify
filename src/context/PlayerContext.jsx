import { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { recordPlay } from "../api/music.api";

const PlayerContext = createContext(null);
const STORAGE_KEY = "musify.player";

function loadPersisted() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [track, setTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds
  const [duration, setDuration] = useState(0);

  // Restore whatever was playing before a refresh: same track, same queue,
  // seeked back to the last known position. We deliberately do NOT call
  // audio.play() here — browsers block autoplay without a user gesture,
  // and silently trying (and failing) is worse UX than just leaving it
  // paused-but-ready.
  useEffect(() => {
    const saved = loadPersisted();
    if (!saved?.track) return;
    const audio = audioRef.current;
    setTrack(saved.track);
    setQueue(saved.queue || []);
    audio.src = saved.track.uri;
    const resumeAt = saved.progress || 0;
    const onLoaded = () => {
      audio.currentTime = resumeAt;
      setProgress(resumeAt);
      setDuration(audio.duration || 0);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onTime = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => playNext();
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, track]);

  // Keep sessionStorage in sync: on every track/queue change, every few
  // seconds while listening, and right before the tab unloads/refreshes.
  useEffect(() => {
    if (!track) return;
    const persist = () => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ track, queue, progress: audioRef.current.currentTime })
        );
      } catch {
        // sessionStorage can throw in private-browsing edge cases — losing
        // resume position isn't worth crashing playback over.
      }
    };
    persist();
    const interval = setInterval(persist, 4000);
    window.addEventListener("beforeunload", persist);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", persist);
    };
  }, [track, queue]);

  const playTrack = useCallback((nextTrack, trackQueue = []) => {
    const audio = audioRef.current;
    setTrack(nextTrack);
    if (trackQueue.length) setQueue(trackQueue);
    audio.src = nextTrack.uri;
    audio.play();
    setIsPlaying(true);
    // Fire-and-forget: updates play count + recently-played on the backend.
    // Never blocks playback and a failure here shouldn't surface to the listener.
    recordPlay(nextTrack._id).catch(() => { });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!track) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, track]);

  const seek = useCallback((seconds) => {
    audioRef.current.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const playNext = useCallback(() => {
    if (!track || queue.length === 0) return;
    const idx = queue.findIndex((t) => t._id === track._id);
    const next = queue[idx + 1];
    if (next) playTrack(next, queue);
    else setIsPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, queue, playTrack]);

  const playPrev = useCallback(() => {
    if (!track || queue.length === 0) return;
    const idx = queue.findIndex((t) => t._id === track._id);
    const prev = queue[idx - 1];
    if (prev) playTrack(prev, queue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, queue, playTrack]);

  return (
    <PlayerContext.Provider
      value={{ track, isPlaying, progress, duration, playTrack, togglePlay, seek, playNext, playPrev }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}