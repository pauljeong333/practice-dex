import * as CONSTANTS from "./constants";

export const setUserRequest = (data) => ({
  type: CONSTANTS.SET_USER_REQUEST,
  payload: data,
});

export const setUserSuccess = (data) => ({
  type: CONSTANTS.SET_USER_SUCCESS,
  payload: data,
});

export const setUserError = (error) => ({
  type: CONSTANTS.SET_USER_ERROR,
  error,
});
