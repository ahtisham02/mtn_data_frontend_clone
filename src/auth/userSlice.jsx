import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiRequest from "../utils/apiRequest";

export const fetchProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { getState, dispatch }) => {
    const state = getState();
    const token = state.auth.userToken;
    if (!token) return null;

    const response = await apiRequest("get", "/user/profile", null, token);
    const profile = response.data?.profile || response.data;

    // After fetching profile, fetch credits if hash is available
    const hash = profile?.client?.[0]?.hash;
    if (hash) {
      dispatch(fetchCredits());
    }
    return profile;
  }
);

export const fetchCredits = createAsyncThunk(
  "user/fetchCredits",
  async (_, { getState }) => {
    const state = getState();
    const token = state.auth.userToken;
    const Hash = state.auth.userInfo?.profile?.client?.[0]?.hash
               || state.user.profileData?.client?.[0]?.hash;

    if (token && Hash) {
      const response = await apiRequest(
        "get",
        "/user/fetch-credits",
        null,
        token,
        { "x-auth-token": Hash }
      );
      return response.data;
    }
    return null;
  }
);

const initialState = {
  creditsInfo: null,
  profileData: null,
  status: "idle",
  profileStatus: "idle",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserCredits: (state) => {
      state.creditsInfo = null;
      state.status = "idle";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        if (action.payload) {
          state.profileData = action.payload;
          // Use credits directly from profile response if no separate credits fetch
          if (!state.creditsInfo && action.payload.remainingCredits !== undefined) {
            state.creditsInfo = {
              remainingCredits: action.payload.remainingCredits,
              totalCredits:     action.payload.totalCredits,
              remainingCalls:   action.payload.remainingCalls   || 0,
              totalCalls:       action.payload.totalCalls       || 0,
            };
            state.status = "succeeded";
          }
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profileStatus = "failed";
      })
      .addCase(fetchCredits.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.status = "succeeded";
        if (action.payload) state.creditsInfo = action.payload;
      })
      .addCase(fetchCredits.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { clearUserCredits } = userSlice.actions;

export default userSlice.reducer;