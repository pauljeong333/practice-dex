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
        title: payload.title,
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

    yield call(updateUser, { payload: updateData });

    yield put(ACTIONS.resetSession());

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

function* resumeSession({ payload }) {
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

    yield put(ACTIONS.resumeSessionSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.resumeSessionError(err.message || "Failed to resume session")
    );
  }
}

function* getUserSessions({ payload }) {
  try {
    const response = yield call(fetch, API.GET_USER_SESSIONS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
      }),
    });

    const data = yield call([response, response.json]);

    yield put(ACTIONS.getUserSessionsSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.getUserSessionsError(err.message || "Failed to get user sessions")
    );
  }
}

function* stopSession({ payload }) {
  try {
    yield call(fetch, API.UPDATE_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        session: payload.session,
      }),
    });

    const updateData = {
      uid: payload.uid,
      fields: {
        activeSession: null,
      },
      idToken: payload.idToken,
    };

    yield call(updateUser, { payload: updateData });

    yield put(ACTIONS.stopSessionSuccess());
  } catch (err) {
    yield put(
      ACTIONS.stopSessionError(err.message || "Failed to stop session")
    );
  }
}

function* finishSession({ payload }) {
  try {
    const response = yield call(fetch, API.UPDATE_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        session: payload.session,
      }),
    });

    const data = yield response.json();
    const updatedSession = data.session;

    yield call(fetch, API.UPDATE_USER_STREAK_PREFERENCES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        newSession: updatedSession,
        timeZone: payload.timeZone,
      }),
    });

    yield put(ACTIONS.finishSessionSuccess());
  } catch (err) {
    yield put(
      ACTIONS.finishSessionError(err.message || "Failed to finish session")
    );
  }
}

function* finishCongrats({ payload }) {
  try {
    yield call(fetch, API.UPDATE_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        sessionId: payload.sessionId,
        session: payload.session,
      }),
    });

    const updateData = {
      uid: payload.uid,
      fields: {
        activeSession: null,
      },
      idToken: payload.idToken,
    };

    yield call(updateUser, { payload: updateData });

    yield put(ACTIONS.finishCongratsSuccess());
  } catch (err) {
    yield put(
      ACTIONS.finishCongratsError(err.message || "Failed to finish congrats")
    );
  }
}

function* fetchRecommendedSession({ payload }) {
  try {
    const response = yield call(fetch, API.GET_RECOMMENDED_SESSION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        instrument: payload.instrument,
      }),
    });

    const data = yield call([response, response.json]);

    yield put(ACTIONS.fetchRecommendedSessionSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.fetchRecommendedSessionError(
        err.message || "Failed to fetch recommended session"
      )
    );
  }
}

export default function* sessionSaga() {
  yield takeLatest(CONSTANTS.SET_SESSION_REQUEST, setSession);
  yield takeLatest(CONSTANTS.GET_SESSION_REQUEST, getSession);
  yield takeLatest(CONSTANTS.RESUME_SESSION_REQUEST, resumeSession);
  yield takeLatest(CONSTANTS.GET_USER_SESSIONS_REQUEST, getUserSessions);
  yield takeLatest(CONSTANTS.STOP_SESSION_REQUEST, stopSession);
  yield takeLatest(CONSTANTS.FINISH_SESSION_REQUEST, finishSession);
  yield takeLatest(CONSTANTS.FINISH_CONGRATS_REQUEST, finishCongrats);
  yield takeLatest(
    CONSTANTS.FETCH_RECOMMENDED_SESSION_REQUEST,
    fetchRecommendedSession
  );
}
