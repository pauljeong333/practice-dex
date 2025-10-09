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

export const updateUserRequest = (data) => ({
  type: CONSTANTS.UPDATE_USER_REQUEST,
  payload: data,
});

export const updateUserSuccess = (data) => ({
  type: CONSTANTS.UPDATE_USER_SUCCESS,
  payload: data,
});

export const updateUserError = (error) => ({
  type: CONSTANTS.UPDATE_USER_ERROR,
  error,
});
