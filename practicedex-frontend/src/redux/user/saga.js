import { put, takeLatest, call } from "redux-saga/effects";
import * as CONSTANTS from "./constants";
import * as ACTIONS from "./actions";

function* updateUser({ payload }) {
  try {
    const response = yield call(fetch, API.UPDATE_USER_REQUEST, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${payload.idToken}`,
      },
      body: JSON.stringify({
        uid: payload.uid,
        fields: payload.fields,
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

    yield put(ACTIONS.setUserSuccess(data));
  } catch (err) {
    yield put(
      ACTIONS.upadteUserError(err.message || "Failed to create session")
    );
  }
}

export default function* userSaga() {
  yield takeLatest(CONSTANTS.UPDATE_USER_REQUEST, updateUser);
}
