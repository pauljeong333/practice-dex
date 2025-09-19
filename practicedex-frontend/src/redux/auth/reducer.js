import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  app: {
    loading: false,
    error: null,
    appCanStart: false,
  },
  signin: {
    loading: false,
    error: false,
  },
};

const authReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case CONSTANTS.SIGNIN_REQUEST:
        draft.signin.loading = true;
        draft.signin.error = null;
        break;
      case CONSTANTS.SIGNIN_SUCCESS:
        draft.user = action.payload.user;
        draft.token = action.payload.token;
        draft.signin.loading = false;
        draft.app.appCanStart = true;
        draft.isAuthenticated = true;
        break;
      case CONSTANTS.SIGNIN_ERROR:
        draft.signin.loading = false;
        draft.signin.error = action.error;
        draft.isAuthenticated = false;
        break;
      case CONSTANTS.SIGNOUT:
        draft.user = null;
        draft.app.appCanStart = true;
        draft.isAuthenticated = false;
        break;
      case CONSTANTS.SET_TOKEN:
        draft.token = action.payload;
        break;
      case CONSTANTS.AUTH_LOADING:
        draft.app.appCanStart = false;
        draft.app.error = null;
        break;
      case CONSTANTS.AUTH_INITIALIZED:
        draft.app.appCanStart = true;
        break;
    }
  });

export default authReducer;
