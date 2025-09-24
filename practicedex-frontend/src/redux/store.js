import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import rootReducer from "./root-reducer";
import rootSaga from "./root-saga";
import { updateActiveSession } from "./session/actions";

const sagaMiddleware = createSagaMiddleware();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["session"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export function hydrateSessionFromStorage(store) {
  const data = localStorage.getItem("interruptedSession");
  if (data) {
    try {
      const session = JSON.parse(data);
      console.log("hydrating from localStorage", session);
      store.dispatch(
        updateActiveSession({
          session: session,
        })
      );

      // Optional: clear once hydrated
      localStorage.removeItem("interruptedSession");
    } catch (err) {
      console.error("Failed to parse interrupted session:", err);
    }
  }
}

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }).concat(sagaMiddleware),
  devTools: true,
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store, null, () => {
  // Only hydrate from interrupted session after persist rehydration is complete
  hydrateSessionFromStorage(store);
});

export default store;
