import { put, takeLatest, call } from "redux-saga/effects";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";
import { setUserSuccess } from "../user/actions";
import { API } from "../../enums/api";

function* signin({ payload }) {
  try {
    const response = yield call(fetch, API.SYNC_USER_SIGNUP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
      }),
    });

    if (!response.ok) {
      const errorData = yield call([response, response.json]);
      throw new Error(
        `API Error: ${response.status} - ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data = yield call([response, response.json]);
    console.log("Sync response:", data);

    yield put(ACTIONS.signinSuccess(data));
    yield put(setUserSuccess(data));
  } catch (err) {
    console.error("Sign-in error", err);
    if (auth.currentUser) {
      yield call(signOut, auth);
    }
    yield put(ACTIONS.signinError(err.message || "Sign-in failed"));
  }
}

function* signout() {
  try {
    yield call(signOut, auth);
    window.location.href = "/";
  } catch (err) {
    yield put(ACTIONS.signinError(err.message || "Sign-in failed"));
  }
}

export default function* authSaga() {
  yield takeLatest(CONSTANTS.SIGNIN_REQUEST, signin);
  yield takeLatest(CONSTANTS.SIGNOUT, signout);
}
