import { eventChannel } from "redux-saga";
import { take, call, put, fork, race } from "redux-saga/effects";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { signinRequest, authInitialized } from "./actions";
import * as CONSTANTS from "./constants";

// Create a channel to listen for Firebase auth state changes
function createAuthChannel() {
  return eventChannel((emit) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      emit({ user });
    });

    // Return unsubscribe function to close the channel
    return unsubscribe;
  });
}

// Worker saga that handles updates from Firebase auth
function* watchAuthStateChanges() {
  const channel = yield call(createAuthChannel);
  let isInitialized = false;

  try {
    console.log("SDJFKDJKS");
    while (true) {
      const { user } = yield take(channel);

      if (user) {
        const idToken = yield call([user, user.getIdToken]); // Get JWT
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          idToken,
        };
        yield put(signinRequest(userData));

        if (!isInitialized) {
          yield race([take("SIGNIN_SUCCESS"), take("SIGNIN_FAILURE")]);
          yield put(authInitialized());
          isInitialized = true;
        }
      } else {
        yield put(authInitialized());
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
