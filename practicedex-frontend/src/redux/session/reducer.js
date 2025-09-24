import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  userSessions: [],
  sessionReady: false,
  activeSession: null,
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
        console.log(action.payload.session);
        draft.activeSession = action.payload.session;
        break;
    }
  });

export default sessionReducer;
