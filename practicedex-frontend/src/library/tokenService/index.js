import { LOCAL_STORAGE_LABELS } from "../../enums/local_storage";

export const saveToken = (token) => {
  localStorage.setItem(LOCAL_STORAGE_LABELS.AUTH_TOKEN, token);
};

export const saveRefreshToken = (token) => {
  localStorage.setItem(LOCAL_STORAGE_LABELS.REFRESH_TOKEN, token);
};

export const removeToken = () => {
  localStorage.removeItem(LOCAL_STORAGE_LABELS.AUTH_TOKEN);
};

export const manageToken = (token = null) => {
  if (typeof token === "string" && token.length > 1) {
    saveToken(token);
    return;
  }
  removeToken();
};

export const getToken = () =>
  localStorage.getItem(LOCAL_STORAGE_LABELS.AUTH_TOKEN) || null;

export const getRefreshToken = () =>
  localStorage.getItem(LOCAL_STORAGE_LABELS.REFRESH_TOKEN) || null;

export default {
  removeToken,
  manageToken,
  saveToken,
  saveRefreshToken,
  getToken,
  getRefreshToken,
};
