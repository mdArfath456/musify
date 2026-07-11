import { api } from "./axios";

export async function registerUser({ username, email, password, role }) {
  const { data } = await api.post("/auth/register", { username, email, password, role });
  return data;
}

export async function loginUser({ identifier, password }) {
  // Backend accepts either username or email under separate keys, so send both.
  const { data } = await api.post("/auth/login", {
    username: identifier,
    email: identifier,
    password,
  });
  return data;
}

export async function logoutUser() {
  const { data } = await api.post("/auth/logout");
  return data;
}
