import { put, takeLatest, call } from "redux-saga/effects";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";
import { API } from "../../enums/api";
import { updateUserRequest } from "../user/actions";
import { UPDATE_USER_SUCCESS } from "../user/constants";

function* setSession({ payload }) {
  try {
    const response = yield call(fetch, API.CREATE_SESSION, {
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

    const data = yield call([response, response.json]); // read once

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${data.message || "Unknown error"}`
      );
    }

    const sessionId = data.sessionId;
    const updateData = {
      uid: payload.uid,
      fields: {
        activeSession: sessionId,
      },
    };

    yield put(updateUserRequest(updateData));

    yield take(UPDATE_USER_SUCCESS);

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
