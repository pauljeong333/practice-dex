import { eventChannel } from "redux-saga";
import { take, call, put, fork, cancel } from "redux-saga/effects";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { signinRequest } from "./actions";

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

  try {
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
      } else {
        //yield put(clearUser());
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
