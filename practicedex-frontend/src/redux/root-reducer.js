import { combineReducers } from "@reduxjs/toolkit";
import Auth from "./auth/reducer";
import { SIGNOUT } from "./auth/constants";

const appReducer = combineReducers({
  Auth,
});

const rootReducer = (state, action) => {
  if (action.type === SIGNOUT) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
