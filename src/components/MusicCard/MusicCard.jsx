import { usePlayer } from "../../context/PlayerContext";
import "./MusicCard.css";

export default function MusicCard({ track, index, queue }) {
  const { track: current, isPlaying, playTrack } = usePlayer();
  const isCurrent = current?._id === track._id;

  return (
    <button
      className={`music-card ${isCurrent ? "active" : ""}`}
      onClick={() => playTrack(track, queue)}
    >
      <span className="music-card-index">{isCurrent && isPlaying ? "♪" : String(index + 1).padStart(2, "0")}</span>
      <div className="music-card-body">
        <p className="music-card-title">{track.title}</p>
        <p className="music-card-artist">{track.artist?.username || "Unknown artist"}</p>
      </div>
    </button>
  );
}
