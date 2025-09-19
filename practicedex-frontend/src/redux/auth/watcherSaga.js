import { eventChannel } from "redux-saga";
import { take, call, put, fork, race } from "redux-saga/effects";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { signinRequest, authInitialized, setToken } from "./actions";

// Create a channel to listen for Firebase ID token changes
function createAuthChannel() {
  return eventChannel((emit) => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          emit({
            type: "LOGIN",
            payload: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              idToken,
            },
          });
        } catch (err) {
          console.error("Failed to get ID token:", err);
          emit({ type: "LOGOUT" });
        }
      } else {
        emit({ type: "LOGOUT" });
      }
    });

    return unsubscribe;
  });
}

// Worker saga to handle login, token refresh, logout
function* watchAuthStateChanges() {
  const channel = yield call(createAuthChannel);
  let isInitialized = false;
  let lastUid = null;

  try {
    while (true) {
      const action = yield take(channel);

      if (action.type === "LOGIN") {
        const user = action.payload;

        if (!isInitialized || user.uid !== lastUid) {
          // First login (or different user)
          yield put(signinRequest(user));

          if (!isInitialized) {
            yield race([take("SIGNIN_SUCCESS"), take("SIGNIN_FAILURE")]);
            yield put(authInitialized());
            isInitialized = true;
          }

          lastUid = user.uid;
        } else {
          // Token refresh only
          yield put(setToken(user.idToken));
        }
      } else if (action.type === "LOGOUT") {
        // Ensure authInitialized is called at least once
        if (!isInitialized) {
          yield put(authInitialized());
          isInitialized = true;
        }
        lastUid = null;
      }
    }
  } finally {
    channel.close();
  }
}

// Root watcher saga
export default function* watchAuthState() {
  yield fork(watchAuthStateChanges);
}
