import { api } from "./axios";

// --- User-role endpoints (require role "user") ---

export async function getAllMusics() {
  const { data } = await api.get("/music");
  return data.musics || [];
}

export async function getAllAlbums() {
  const { data } = await api.get("/music/albums");
  return data.albums || [];
}

export async function getAlbumById(albumId) {
  const { data } = await api.get(`/music/albums/${albumId}`);
  return data.album;
}

// --- Artist-role endpoints (require role "artist") ---

export async function uploadMusic({ title, file }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("music", file);
  const { data } = await api.post("/music/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.music;
}

export async function createAlbum({ title, musicIds }) {
  const { data } = await api.post("/music/album", { title, musics: musicIds });
  return data.album;
}

export async function addMusicToAlbum({ albumId, musicId }) {
  const { data } = await api.post(`/music/album/${albumId}/add-music`, { musicId });
  return data.album;
}
