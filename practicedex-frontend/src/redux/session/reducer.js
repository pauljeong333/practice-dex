import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  userSessions: [],
  sessionReady: false,
  activeSession: null,
  toHome: false,
  toCongrats: false,
  loading: false,
  error: null,
};

const sessionReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case CONSTANTS.SET_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.SET_SESSION_SUCCESS:
        draft.activeSession = action.payload.session;
        draft.sessionReady = true;
        draft.toHome = false;
        draft.loading = false;
        break;
      case CONSTANTS.SET_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.GET_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.GET_SESSION_SUCCESS:
        draft.activeSession = action.payload.session;
        draft.loading = false;
        break;
      case CONSTANTS.GET_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.UPDATE_ACTIVE_SESSION:
        draft.activeSession = action.payload.session;
        break;
      case CONSTANTS.STOP_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.STOP_SESSION_SUCCESS:
        draft.loading = false;
        draft.toHome = true;
        break;
      case CONSTANTS.STOP_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.FINISH_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.FINISH_SESSION_SUCCESS:
        draft.loading = false;
        draft.activeSession = null;
        draft.toCongrats = true;
        break;
      case CONSTANTS.FINISH_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.FINISH_CONGRATS_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.FINISH_CONGRATS_SUCCESS:
        draft.loading = false;
        draft.toHome = true;
        break;
      case CONSTANTS.FINISH_CONGRATS_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.RESET_SESSION:
        draft.sessionReady = false;
        draft.toHome = false;
        draft.toCongrats = false;
        draft.error = null;
        break;
    }
  });

export default sessionReducer;
