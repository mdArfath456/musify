import { Link } from "react-router-dom";
import { usePlayer } from "../../context/PlayerContext";
import { useLikes } from "../../context/LikesContext";
import "./MusicCard.css";

export default function MusicCard({ track, index, queue }) {
  const { track: current, isPlaying, playTrack } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const isCurrent = current?._id === track._id;
  const liked = isLiked(track._id);

  return (
    <div className={`music-card ${isCurrent ? "active" : ""}`}>
      <button className="music-card-main" onClick={() => playTrack(track, queue)}>
        <span className="music-card-index">{isCurrent && isPlaying ? "♪" : String(index + 1).padStart(2, "0")}</span>
        <div className="music-card-body">
          <p className="music-card-title">{track.title}</p>
          {track.artist?._id ? (
            <Link
              to={`/artists/${track.artist._id}`}
              className="music-card-artist music-card-artist-link"
              onClick={(e) => e.stopPropagation()}
            >
              {track.artist.username}
            </Link>
          ) : (
            <p className="music-card-artist">Unknown artist</p>
          )}
        </div>
      </button>
      <button
        className={`music-card-like ${liked ? "liked" : ""}`}
        aria-label={liked ? "Unlike this track" : "Like this track"}
        aria-pressed={liked}
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track._id);
        }}
      >
        {liked ? "♥" : "♡"}
      </button>
    </div>
  );
}