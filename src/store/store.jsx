// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/authSlice";
import creditsReducer from "../auth/creditsSlice";

const authPersistConfig = {
  key: "auth",
  storage,
};

const creditsPersistConfig = {
  key: "credits",
  storage,
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedCreditsReducer = persistReducer(creditsPersistConfig, creditsReducer);

const rootReducer = {
  auth: persistedAuthReducer,
  credits: persistedCreditsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export const persistor = persistStore(store);