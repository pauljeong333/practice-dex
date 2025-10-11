import * as CONSTANTS from "./constants";

export const sendChatRequest = (data) => ({
  type: CONSTANTS.SEND_CHAT_REQUEST,
  payload: data,
});

export const sendChatSuccess = (data) => ({
  type: CONSTANTS.SEND_CHAT_SUCCESS,
  payload: data,
});

export const sendChatError = (error) => ({
  type: CONSTANTS.SEND_CHAT_ERROR,
  error,
});
