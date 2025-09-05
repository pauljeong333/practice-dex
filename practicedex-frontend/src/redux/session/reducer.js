import { produce } from "immer";
import * as CONSTANTS from "./constants";

const initialState = {
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
        draft.loading = false;
        break;
      case CONSTANTS.SET_SESSION_ERROR:
        draft.loading = false;
        draft.error = action.error;
        break;
    }
  });

export default sessionReducer;
