import * as CONSTANTS from "./constants";

export const setSessionRequest = (data) => ({
  type: CONSTANTS.SET_SESSION_REQUEST,
  payload: data,
});

export const setSessionSuccess = (data) => ({
  type: CONSTANTS.SET_SESSION_SUCCESS,
  payload: data,
});

export const setSessionError = () => ({
  type: CONSTANTS.GET_SESSIONS_ERROR,
  error,
});
