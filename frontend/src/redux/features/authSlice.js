// import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
// import authService from "../services/authFeatures";
// import {toast} from 'react-toastify';

// const getUserFromLocalStorage = () => {
//     try {
//         const storedUser = localStorage.getItem("user");
//         if (storedUser && storedUser !== "undefined") {
//             return JSON.parse(storedUser);
//         }
//     } catch (error) {
//         console.error("Failed to parse user from localStorage", error);
//     }
//     return null; 
// };


// const initialState ={
//     // user: JSON.parse(localStorage.getItem("user")) || null,
//     user: getUserFromLocalStorage(),
//     users: [],
//     isError: false,
//     isSuccess: false,
//     isLoading: false,
//     message: "",
// };

// export const register = createAsyncThunk(
//   "users/register",
//   async (userData, thunkAPI) => {
//     try {
//       const response = await authService.register(userData);
//       if (response.user) {
//         localStorage.setItem("user", JSON.stringify(response.user));
//       }
//       return response.user;
//     } catch (error) {
//       const message =
//         (error.response &&
//           error.response.data &&
//           error.response.data.message) ||
//         error.message ||
//         "Registration failed";
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// export const login = createAsyncThunk('users/login', async (userData, thunkAPI) => {
//   try {
//     const response = await authService.login(userData);
//     if (response.token) {
//       localStorage.setItem("user", JSON.stringify(response.user));
//       localStorage.setItem("token", response.token);
//     }
//     return response.user;
//   } catch (error) {
//     const message = 
//          (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
//       return thunkAPI.rejectWithValue(message);
//   }
// });

// export const loginAdmin = createAsyncThunk(
//   'admins/login', 
//   async (adminData, thunkAPI) => {
//     try {
//       const data = await authService.loginAdmin(adminData);
//       localStorage.setItem("user", JSON.stringify(data));
//       return data;
//     } catch (error) {
//       const message = 
//         (error.response && error.response.data && error.response.data.message) ||
//         error.message ||
//         error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers: {
//         RESET(state) {
//             state.isError=false;
//             state.isSuccess =false;
//             state.isLoading=false;
//             state.message="";
//         },
//     },
//     extraReducers : (builder) =>{
//         builder
//             .addCase(register.pending, (state) =>{
//                 state.isLoading =true;
//             })
//             .addCase(register.fulfilled, (state,action)=>{
//                 state.isLoading = false;
//                 state.isSuccess = true;
//                 state.isLoggedIn = true;
//                 state.user=action.payload;
//                 toast.success("Registration Successful! Please Login.")
//             })
//             .addCase(register.rejected, (state,action)=>{
//                 state.isLoading = false;
//                 state.isError = true;
//                 state.message= action.payload;
//                 state.user=null;
//                 toast.error(action.payload);
//             })
//             // Login Cases
//             .addCase(login.pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(login.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isSuccess = true;
//                 state.user = action.payload;
//                 toast.success("Login Successful!");
//             })
//             .addCase(login.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.isError = true;
//                 state.message = action.payload;
//                 state.user = null;
//                 toast.error(action.payload);
//             })
//             //Admin cases
//              .addCase(loginAdmin.pending, (state) => {
//                 state.isLoading = true;
//             })
//             .addCase(loginAdmin.fulfilled, (state, action) => {
//                 state.isLoading = false;
//                 state.isSuccess = true;
//                 state.user = action.payload;
//                 toast.success("Admin Login Successful!");
//             })
//             .addCase(loginAdmin.rejected, (state, action) => {
//                 state.isLoading = false;
//                 state.isError = true;
//                 state.message = action.payload;
//                 state.user = null;
//                 toast.error(action.payload);
//             });
//     },
// });

// export const {RESET} = authSlice.actions

// export default authSlice.reducer;




import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authFeatures";
import { toast } from "react-toastify";

// --- Utility to safely get user + token from localStorage ---
const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
  }
  return null;
};

const getTokenFromLocalStorage = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (error) {
    console.error("Failed to get token from localStorage", error);
    return null;
  }
};

// --- Initial State ---
const initialState = {
  user: getUserFromLocalStorage(),
  token: getTokenFromLocalStorage(),
  users: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// --- Register ---
export const register = createAsyncThunk(
  "users/register",
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      if (response.user && response.token) {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      }
      return { user: response.user, token: response.token };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Registration failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Login (User) ---
export const login = createAsyncThunk(
  "users/login",
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData);
      if (response.token) {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      }
      return { user: response.user, token: response.token };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Login (Admin) ---
export const loginAdmin = createAsyncThunk(
  "admins/login",
  async (adminData, thunkAPI) => {
    try {
      const response = await authService.loginAdmin(adminData);
      if (response.token) {
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("token", response.token);
      }
      return { user: response.user, token: response.token };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    RESET(state) {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = "";
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Registration Successful!");
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
        toast.error(action.payload);
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Login Successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
        toast.error(action.payload);
      })

      // Admin Login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        localStorage.setItem("adminToken", action.payload.token);
  localStorage.setItem("adminUser", JSON.stringify(action.payload.user));

        toast.success("Admin Login Successful!");
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
        toast.error(action.payload);
      });
  },
});

export const { RESET, logout } = authSlice.actions;
export default authSlice.reducer;
