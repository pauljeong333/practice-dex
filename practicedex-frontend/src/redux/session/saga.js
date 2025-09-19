import { put, takeLatest, call } from "redux-saga/effects";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";
import { API } from "../../enums/api";
import { updateUser } from "../user/saga";

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
        totalDuration: payload.totalDuration,
        currentDuration: payload.currentDuration,
        status: payload.status,
      }),
    });

    const data = yield call([response, response.json]);

    if (!response.ok) {
      throw new Error(
        `API Error: ${response.status} - ${data.message || "Unknown error"}`
      );
    }

    const sessionId = data.session.session_id;
    const updateData = {
      uid: payload.uid,
      fields: {
        activeSession: sessionId,
      },
      idToken: payload.idToken,
    };

    console.log("Waiting for user update to complete...");
    yield call(updateUser, { payload: updateData });
    console.log("User update complete, finishing session creation!");

    yield put(ACTIONS.setSessionSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.setSessionError(err.message || "Failed to create session")
    );
  }
}

function* getSession({ payload }) {
  try {
    const response = yield call(fetch, API.GET_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        sessionId: payload.sessionId,
      }),
    });

    const data = yield call([response, response.json]);

    yield put(ACTIONS.getSessionSuccess(data));
  } catch (err) {
    yield put(ACTIONS.getSessionError(err.message || "Failed to get session"));
  }
}

export default function* sessionSaga() {
  yield takeLatest(CONSTANTS.SET_SESSION_REQUEST, setSession);
  yield takeLatest(CONSTANTS.GET_SESSION_REQUEST, getSession);
}
