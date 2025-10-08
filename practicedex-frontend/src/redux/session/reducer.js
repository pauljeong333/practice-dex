import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  userSessions: [],
  schedule: {
    scheduledSessions: [],
    loading: false,
    error: null,
    scheduled: false,
  },
  sessionReady: false,
  activeSession: null,
  recommendedSession: null,
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
      case CONSTANTS.START_SCHEDULED_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.START_SCHEDULED_SESSION_SUCCESS:
        draft.activeSession = action.payload.session;
        draft.sessionReady = true;
        draft.toHome = false;
        draft.loading = false;
        break;
      case CONSTANTS.START_SCHEDULED_SESSION_ERROR:
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
      case CONSTANTS.SCHEDULE_SESSION_REQUEST:
        draft.schedule.loading = true;
        break;
      case CONSTANTS.SCHEDULE_SESSION_SUCCESS:
        draft.schedule.scheduled = true;
        draft.schedule.loading = false;
        break;
      case CONSTANTS.SCHEDULE_SESSION_ERROR:
        draft.schedule.loading = false;
        draft.schedule.error = action.error;
        break;
      case CONSTANTS.RESET_SCHEDULE:
        draft.schedule.scheduled = false;
        break;
      case CONSTANTS.RESUME_SESSION_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.RESUME_SESSION_SUCCESS:
        draft.activeSession = action.payload.session;
        draft.sessionReady = true;
        draft.toHome = false;
        draft.loading = false;
        break;
      case CONSTANTS.RESUME_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.GET_USER_SESSIONS_REQUEST:
        draft.loading = true;
        break;
      case CONSTANTS.GET_USER_SESSIONS_SUCCESS:
        draft.userSessions = action.payload.sessions;
        draft.loading = false;
        break;
      case CONSTANTS.GET_USER_SESSIONS_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.GET_SCHEDULED_SESSIONS_REQUEST:
        draft.schedule.loading = true;
        break;
      case CONSTANTS.GET_SCHEDULED_SESSIONS_SUCCESS:
        draft.schedule.scheduledSessions = action.payload.sessions;
        draft.schedule.loading = false;
        break;
      case CONSTANTS.GET_SCHEDULED_SESSIONS_ERROR:
        draft.schedule.loading = false;
        draft.schedule.error = action.error;
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
      case CONSTANTS.FETCH_RECOMMENDED_SESSION_REQUEST:
        draft.loading = true;
        draft.error = null;
        break;
      case CONSTANTS.FETCH_RECOMMENDED_SESSION_SUCCESS:
        draft.recommendedSession = action.payload;
        draft.loading = false;
        break;
      case CONSTANTS.FETCH_RECOMMENDED_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.RESET_SESSION:
        draft.sessionReady = false;
        draft.toHome = false;
        draft.toCongrats = false;
        draft.error = null;
        break;
      case CONSTANTS.RESET_RECOMMENDED_SESSION:
        draft.recommendedSession = null;
        break;
    }
  });

export default sessionReducer;
