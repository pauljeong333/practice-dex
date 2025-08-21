import { put, takeLatest, call } from "redux-saga/effects";
import tokenService from "@library/tokenService";
import * as CONSTANTS from "./constants";

function* signin({ payload }) {
  try {
    const data = yield call(request, "/token/", "POST", payload, false);
    tokenService.manageToken(data.access);
    tokenService.saveRefreshToken(data.refresh);
    yield put(ACTIONS.signinSuccess(serializeKeys(data)));
  } catch (error) {
    yield put(ACTIONS.signinError(error));
  }
}

export default function* authSaga() {
  yield takeLatest(CONSTANTS.SIGNIN_REQUEST, signin);
}
