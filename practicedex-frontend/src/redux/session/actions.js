import * as CONSTANTS from "./constants";

export const setSessionRequest = (data) => ({
  type: CONSTANTS.SET_SESSION_REQUEST,
  payload: data,
});

export const setSessionSuccess = (data) => ({
  type: CONSTANTS.SET_SESSION_SUCCESS,
  payload: data,
});

export const setSessionError = (error) => ({
  type: CONSTANTS.SET_SESSION_ERROR,
  error,
});

export const getSessionRequest = (data) => ({
  type: CONSTANTS.GET_SESSION_REQUEST,
  payload: data,
});

export const getSessionSuccess = (data) => ({
  type: CONSTANTS.GET_SESSION_SUCCESS,
  payload: data,
});

export const getSessionError = (error) => ({
  type: CONSTANTS.GET_SESSION_ERROR,
  error,
});
