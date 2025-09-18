import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import Auth from "./auth/reducer";
import User from "./user/reducer";
import Session from "./session/reducer";
import { SIGNOUT } from "./auth/constants";

const sessionPersistConfig = {
  key: "session",
  storage,
  whitelist: ["activeSession"],
};

const appReducer = combineReducers({
  Auth,
  User,
  Session: persistReducer(sessionPersistConfig, Session),
});

const rootReducer = (state, action) => {
  if (action.type === SIGNOUT) {
    storage.removeItem("persist:session");

    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
