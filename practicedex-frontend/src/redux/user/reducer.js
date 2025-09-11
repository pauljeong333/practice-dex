import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case CONSTANTS.SET_USER_REQUEST:
        draft.loading = true;
        draft.error = null;
        break;
      case CONSTANTS.SET_USER_SUCCESS:
        draft.user = {
          ...action.payload.user,
        };
        draft.loading = false;
        break;
      case CONSTANTS.SET_USER_ERROR:
        draft.user = null;
        draft.loading = false;
        draft.error = action.error;
        break;
      case CONSTANTS.UPDATE_USER_REQUEST:
        draft.loading = true;
        draft.error = null;
        break;
      case CONSTANTS.UPDATE_USER_SUCCESS:
        draft.user = {
          ...action.payload.user,
        };
        draft.loading = false;
        break;
      case CONSTANTS.UPDATE_USER_ERROR:
        draft.user = null;
        draft.loading = false;
        draft.error = action.error;
        break;
    }
  });

export default userReducer;
