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

export const scheduleSessionRequest = (data) => ({
  type: CONSTANTS.SCHEDULE_SESSION_REQUEST,
  payload: data,
});

export const scheduleSessionSuccess = () => ({
  type: CONSTANTS.SCHEDULE_SESSION_SUCCESS,
});

export const scheduleSessionError = (error) => ({
  type: CONSTANTS.SCHEDULE_SESSION_ERROR,
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

export const resumeSessionRequest = (data) => ({
  type: CONSTANTS.RESUME_SESSION_REQUEST,
  payload: data,
});

export const resumeSessionSuccess = (data) => ({
  type: CONSTANTS.RESUME_SESSION_SUCCESS,
  payload: data,
});

export const resumeSessionError = (error) => ({
  type: CONSTANTS.RESUME_SESSION_ERROR,
  error,
});

export const getUserSessionsRequest = (data) => ({
  type: CONSTANTS.GET_USER_SESSIONS_REQUEST,
  payload: data,
});

export const getUserSessionsSuccess = (data) => ({
  type: CONSTANTS.GET_USER_SESSIONS_SUCCESS,
  payload: data,
});
export const getUserSessionsError = (error) => ({
  type: CONSTANTS.GET_USER_SESSIONS_ERROR,
  error,
});

export const getScheduledSessionsRequest = (data) => ({
  type: CONSTANTS.GET_SCHEDULED_SESSIONS_REQUEST,
  payload: data,
});

export const getScheduledSessionsSuccess = (data) => ({
  type: CONSTANTS.GET_SCHEDULED_SESSIONS_SUCCESS,
  payload: data,
});

export const getScheduledSessionsError = (error) => ({
  type: CONSTANTS.GET_SCHEDULED_SESSIONS_ERROR,
  error,
});

export const updateActiveSession = (data) => ({
  type: CONSTANTS.UPDATE_ACTIVE_SESSION,
  payload: data,
});

export const stopSessionRequest = (data) => ({
  type: CONSTANTS.STOP_SESSION_REQUEST,
  payload: data,
});

export const stopSessionSuccess = () => ({
  type: CONSTANTS.STOP_SESSION_SUCCESS,
});

export const stopSessionError = (error) => ({
  type: CONSTANTS.STOP_SESSION_ERROR,
  error,
});

export const finishSessionRequest = (data) => ({
  type: CONSTANTS.FINISH_SESSION_REQUEST,
  payload: data,
});

export const finishSessionSuccess = () => ({
  type: CONSTANTS.FINISH_SESSION_SUCCESS,
});

export const finishSessionError = (error) => ({
  type: CONSTANTS.FINISH_SESSION_ERROR,
  error,
});

export const finishCongratsRequest = (data) => ({
  type: CONSTANTS.FINISH_CONGRATS_REQUEST,
  payload: data,
});

export const finishCongratsSuccess = () => ({
  type: CONSTANTS.FINISH_CONGRATS_SUCCESS,
});

export const finishCongratsError = (error) => ({
  type: CONSTANTS.FINISH_CONGRATS_ERROR,
  error,
});

export const fetchRecommendedSessionRequest = (data) => ({
  type: CONSTANTS.FETCH_RECOMMENDED_SESSION_REQUEST,
  payload: data,
});

export const fetchRecommendedSessionSuccess = (data) => ({
  type: CONSTANTS.FETCH_RECOMMENDED_SESSION_SUCCESS,
  payload: data,
});

export const fetchRecommendedSessionError = (error) => ({
  type: CONSTANTS.FETCH_RECOMMENDED_SESSION_ERROR,
  error,
});

export const resetSession = () => ({
  type: CONSTANTS.RESET_SESSION,
});

export const resetRecommendedSession = () => ({
  type: CONSTANTS.RESET_RECOMMENDED_SESSION,
});

export const resetSchedule = () => ({
  type: CONSTANTS.RESET_SCHEDULE,
});
