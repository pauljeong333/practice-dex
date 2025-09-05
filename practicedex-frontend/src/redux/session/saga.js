import { put, takeLatest, call } from "redux-saga/effects";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";

function* setSession({ payload }) {
  try {
    const response = yield call(fetch, "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        instrument: payload.instrument,
        goals: payload.goals,
        duration: payload.duration,
        status: payload.status,
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

    yield put(ACTIONS.setSessionSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.setSessionError(err.message || "Failed to create session")
    );
  }
}

export default function* sessionSaga() {
  yield takeLatest(CONSTANTS.SET_SESSION_REQUEST, setSession);
}
