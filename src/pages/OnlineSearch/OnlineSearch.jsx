import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Loader from "../../components/Loader/Loader";
import EmptyState from "../../components/EmptyState/EmptyState";
import { searchOnline } from "../../api/youtube.api";
import { useYoutubePlayer } from "../../hooks/useYoutubePlayer";
import "./OnlineSearch.css";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OnlineSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null); // { videoId, title, channelTitle }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const { isReady, isPlaying, duration, currentTime, loadVideo, togglePlay, seek } =
    useYoutubePlayer("yt-player-container");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await searchOnline(query);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message || "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const playResult = (result) => {
    setNowPlaying(result);
    if (isReady) loadVideo(result.videoId);
  };

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="page">
      <Navbar title="Online Search" subtitle="Search and play songs from YouTube, right here." />

      <div className="page-body">
        <form className="online-search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song, artist, or album..."
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !query.trim()}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {/* The actual YouTube player mounts into this div — kept small since
            audio is the point, not video, but still visible for ToS-compliant playback. */}
        <div className={`online-player ${nowPlaying ? "" : "online-player-hidden"}`}>
          <div id="yt-player-container" />
        </div>

        {nowPlaying && (
          <div className="online-now-playing">
            <div>
              <p className="online-now-playing-title">{nowPlaying.title}</p>
              <p className="online-now-playing-channel">{nowPlaying.channelTitle}</p>
            </div>
            <div className="online-now-playing-controls">
              <button className="btn btn-ghost" onClick={togglePlay} disabled={!isReady}>
                {isPlaying ? "Pause" : "Play"}
              </button>
              <span className="online-now-playing-time">{formatTime(currentTime)}</span>
              <div className="online-scrub" onClick={handleScrub}>
                <div className="online-scrub-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="online-now-playing-time">{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {loading && <Loader label="Searching online" />}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && searched && results.length === 0 && (
          <EmptyState title="No results" description={`Nothing found for "${query}".`} />
        )}
        {!loading && !error && !searched && (
          <EmptyState title="Search anything" description="Type a song or artist name to find and play it instantly." />
        )}

        {!loading && !error && results.length > 0 && (
          <div className="online-results">
            {results.map((r) => (
              <button key={r.videoId} className="online-result-card" onClick={() => playResult(r)}>
                <img src={r.thumbnail} alt="" />
                <div>
                  <p className="online-result-title">{r.title}</p>
                  <p className="online-result-channel">{r.channelTitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}