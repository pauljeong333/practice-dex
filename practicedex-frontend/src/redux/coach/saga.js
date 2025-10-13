import { put, takeLatest, call } from "redux-saga/effects";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";
import { API } from "../../enums/api";

function* sendChat({ payload }) {
  try {
    const response = yield call(fetch, API.CHAT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        instrument: payload.instrument,
        userMessage: payload.userMessage,
        sessionUpdated: payload.sessionUpdated,
        newChat: payload.newChat,
      }),
    });

    const data = yield call([response, response.json]);

    yield put(ACTIONS.sendChatSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.sendChatError(err.message || "Something went wrong with Chat")
    );
  }
}

export default function* coachSaga() {
  yield takeLatest(CONSTANTS.SEND_CHAT_REQUEST, sendChat);
}
