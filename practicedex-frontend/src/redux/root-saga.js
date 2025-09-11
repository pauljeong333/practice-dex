import { all } from "redux-saga/effects";
import authSaga from "./auth/saga";
import watchAuthState from "./auth/watcherSaga";
import userSaga from "./user/saga";
import sessionSaga from "./session/saga";

export default function* rootSaga(getState) {
  yield all([authSaga(), watchAuthState(), userSaga(), sessionSaga()]);
}
