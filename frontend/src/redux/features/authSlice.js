import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import authService from "../services/authFeatures";
import {toast} from 'react-toastify';

const initialState ={
    user: JSON.parse(localStorage.getItem("user")) || null,
    users: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

export const register = createAsyncThunk("auth/register", async(userData, thunkAPI)=>{
    try {
        const response = await authService.register(userData);
        localStorage.setItem("user", JSON.stringify(response));
        return response;
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||error.message || "Registration failed";
        return thunkAPI.rejectWithValue(message);
    }
})


export const login = createAsyncThunk(
  'auth/login', 
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = 
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        RESET(state) {
            state.isError=false;
            state.isSuccess =false;
            state.isLoading=false;
            state.message="";
        },
    },
    extraReducers : (builder) =>{
        builder
            .addCase(register.pending, (state) =>{
                state.isLoading =true;
            })
            .addCase(register.fulfilled, (state,action)=>{
                state.isLoading = false;
                state.isSuccess = true;
                state.isLoggedIn = true;
                state.user=action.payload;
            })
            .addCase(register.rejected, (state,action)=>{
                state.isLoading = false;
                state.isError = true;
                state.message= action.payload;
                state.user=null;
                toast.error(action.payload);
            })
            // Login Cases
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
                toast.success("Login Successful!");
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                toast.error(action.payload);
            });
    },
});

export const {RESET} = authSlice.actions

export default authSlice.reducer;