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
