// src/store/creditsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  creditsInfo: null,
  error: null,
};

export const creditsSlice = createSlice({
  name: "credits",
  initialState,
  reducers: {
    setCredits: (state, action) => {
      state.loading = false;
      state.creditsInfo = action.payload;
      state.error = null;
    },
    clearCredits: (state) => {
      state.creditsInfo = null;
      state.error = null;
      state.loading = false;
    },
    setCreditsLoading: (state) => {
      state.loading = true;
    },
    setCreditsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setCredits, clearCredits, setCreditsLoading, setCreditsError } =
  creditsSlice.actions;

export default creditsSlice.reducer;