import { all } from "redux-saga/effects";
import authSaga from "./auth/saga";
import watchAuthState from "./auth/watcherSaga";

export default function* rootSaga(getState) {
  yield all([authSaga(), watchAuthState()]);
}
