import { useEffect, useRef, useState, useCallback } from "react";

// Loads the YouTube IFrame Player API script exactly once, no matter how
// many components on the page need it. No API key required for this part —
// only the Data API (search) needs a key; playback control is a free, public script.
let apiPromise = null;
function loadYoutubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;

    apiPromise = new Promise((resolve) => {
        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prevCallback?.();
            resolve(window.YT);
        };
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
    });
    return apiPromise;
}

export function useYoutubePlayer(containerId) {
    const playerRef = useRef(null);
    const pollRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        let cancelled = false;
        loadYoutubeApi().then((YT) => {
            if (cancelled) return;
            playerRef.current = new YT.Player(containerId, {
                height: "100%",
                width: "100%",
                playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0 },
                events: {
                    onReady: () => setIsReady(true),
                    onStateChange: (e) => {
                        setIsPlaying(e.data === YT.PlayerState.PLAYING);
                        if (e.data === YT.PlayerState.PLAYING) {
                            setDuration(playerRef.current.getDuration());
                        }
                    }
                }
            });
        });

        return () => {
            cancelled = true;
            clearInterval(pollRef.current);
            playerRef.current?.destroy?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerId]);

    useEffect(() => {
        pollRef.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 500);
        return () => clearInterval(pollRef.current);
    }, []);

    const loadVideo = useCallback((videoId) => {
        playerRef.current?.loadVideoById?.(videoId);
    }, []);

    const togglePlay = useCallback(() => {
        if (!playerRef.current) return;
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    }, [isPlaying]);

    const seek = useCallback((seconds) => {
        playerRef.current?.seekTo(seconds, true);
        setCurrentTime(seconds);
    }, []);

    return { isReady, isPlaying, duration, currentTime, loadVideo, togglePlay, seek };
}