import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import MusicCard from "../../components/MusicCard/MusicCard";
import Loader from "../../components/Loader/Loader";
import EmptyState from "../../components/EmptyState/EmptyState";
import { getAllMusics } from "../../api/music.api";
import "./Library.css";

export default function Library() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllMusics()
      .then((data) => {
        if (!cancelled) setTracks(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load your library.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <Navbar title="Library" subtitle="Every track uploaded across Musify, freshest first." />

      <div className="page-body">
        {loading && <Loader label="Cueing up your library" />}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && tracks.length === 0 && (
          <EmptyState title="No tracks yet" description="Once an artist uploads a track, it'll show up here." />
        )}
        {!loading && !error && tracks.length > 0 && (
          <div className="track-list">
            {tracks.map((track, i) => (
              <MusicCard key={track._id} track={track} index={i} queue={tracks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
