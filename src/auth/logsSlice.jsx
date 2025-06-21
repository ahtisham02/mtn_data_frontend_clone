// src/store/logsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  logs: [],
  error: null,
};

export const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setLogsLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setLogsSuccess: (state, action) => {
      state.loading = false;
      state.logs = action.payload;
    },
    setLogsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearLogs: (state) => {
      state.loading = false;
      state.logs = [];
      state.error = null;
    },
  },
});

export const { setLogsLoading, setLogsSuccess, setLogsError, clearLogs } =
  logsSlice.actions;

export default logsSlice.reducer;