import * as CONSTANTS from "./constants";

export const signinRequest = (data) => ({
  type: CONSTANTS.SIGNIN_REQUEST,
  payload: data,
});

export const signinSuccess = (data) => ({
  type: CONSTANTS.SIGNIN_SUCCESS,
  payload: data,
});

export const signinError = (error) => ({
  type: CONSTANTS.SIGNIN_ERROR,
  error,
});

export const signout = () => ({
  type: CONSTANTS.SIGNOUT,
});

export const setToken = (data) => ({
  type: CONSTANTS.SET_TOKEN,
  payload: data,
});

export const authLoading = () => ({
  type: CONSTANTS.AUTH_LOADING,
});

export const authInitialized = () => ({
  type: CONSTANTS.AUTH_INITIALIZED,
});
