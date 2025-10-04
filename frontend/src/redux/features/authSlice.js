import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authFeatures";
import { toast } from "react-toastify";

const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  } catch (error) { return null; }
};

const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token") || null;
};

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  isLoggedIn: user ? true : false,
  user: user ? user : null,
  token: getTokenFromLocalStorage(),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

// --- Thunks ---
const createAuthThunk = (name, service) => createAsyncThunk(name, async (data, thunkAPI) => {
  try {
    const response = await service(data);
    if (response.token && response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      return response;
    }
    throw new Error("Invalid server response");
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const register = createAuthThunk("auth/register", authService.register);
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
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
export const loginAdmin = createAuthThunk("auth/loginAdmin", authService.loginAdmin);

// --- Slice Definition ---
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
    const handlePending = (state) => { state.isLoading = true; state.isSuccess = false; };
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.message = action.payload;
      state.user = null;
      state.token = null;
      toast.error(action.payload);
    };
    const handleFulfilled = (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    };

    builder
      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        toast.success("Registration Successful!");
      })
      .addCase(register.rejected, handleRejected)
      .addCase(login.pending, handlePending)
       .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Login Successful");
        // localStorage.setItem("user", JSON.stringify(action.payload));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, handleRejected)
      .addCase(loginAdmin.pending, handlePending)
      .addCase(loginAdmin.fulfilled, (state, action) => {
        handleFulfilled(state, action);
        toast.success("Admin Login Successful!");
      })
      .addCase(loginAdmin.rejected, handleRejected);
  },
});

export const { RESET, logout } = authSlice.actions;
export default authSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import authService from "../services/authFeatures";
// import { toast } from "react-toastify";

// // --- Utility to safely get user + token from localStorage ---
// const getUserFromLocalStorage = () => {
//   try {
//     const storedUser = localStorage.getItem("user");
//     if (storedUser && storedUser !== "undefined") {
//       return JSON.parse(storedUser);
//     }
//   } catch (error) {
//     console.error("Failed to parse user from localStorage", error);
//   }
//   return null;
// };

// const getTokenFromLocalStorage = () => {
//   try {
//     return localStorage.getItem("token") || null;
//   } catch (error) {
//     console.error("Failed to get token from localStorage", error);
//     return null;
//   }
// };

// // --- Initial State ---
// const initialState = {
//   user: getUserFromLocalStorage(),
//   token: getTokenFromLocalStorage(),
//   users: [],
//   isError: false,
//   isSuccess: false,
//   isLoading: false,
//   message: "",
// };

// // --- Register ---
// export const register = createAsyncThunk(
//   "users/register",
//   async (userData, thunkAPI) => {
//     try {
//       const response = await authService.register(userData);
//       if (response.user && response.token) {
//         localStorage.setItem("user", JSON.stringify(response.user));
//         localStorage.setItem("token", response.token);
//       }
//       return { user: response.user, token: response.token };
//     } catch (error) {
//       const message =
//         (error.response && error.response.data && error.response.data.message) ||
//         error.message ||
//         "Registration failed";
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// // --- Login (User) ---
// export const login = createAsyncThunk(
//   "users/login",
//   async (userData, thunkAPI) => {
//     try {
//       const response = await authService.login(userData);
//       if (response.token) {
//         localStorage.setItem("user", JSON.stringify(response.user));
//         localStorage.setItem("token", response.token);
//       }
//       // return { user: response.user, token: response.token };
//       return response;
//     } catch (error) {
//       const message =
//         (error.response &&
//           error.response.data &&
//           error.response.data.message) ||
//         error.message ||
//         error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// // --- Login (Admin) ---
// export const loginAdmin = createAsyncThunk(
//   "admins/login",
//   async (adminData, thunkAPI) => {
//     try {
//       const response = await authService.loginAdmin(adminData);
//       if (response.token) {
//         localStorage.setItem("user", JSON.stringify(response.user));
//         localStorage.setItem("token", response.token);
//       }
//       // return { user: response.user, token: response.token };
//       return response;
//     } catch (error) {
//       const message =
//         (error.response &&
//           error.response.data &&
//           error.response.data.message) ||
//         error.message ||
//         error.toString();
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

// // --- Slice ---
// // const authSlice = createSlice({
// //   name: "auth",
// //   initialState,
// //   reducers: {
// //     RESET(state) {
// //       state.isError = false;
// //       state.isSuccess = false;
// //       state.isLoading = false;
// //       state.message = "";
// //     },
// //     logout(state) {
// //       state.user = null;
// //       state.token = null;
// //       localStorage.removeItem("user");
// //       localStorage.removeItem("token");
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     builder
// //       // Register
// //       .addCase(register.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(register.fulfilled, (state, action) => {
// //         state.isLoading = false;
// //         state.isSuccess = true;
// //         state.user = action.payload.user;
// //         state.token = action.payload.token;
// //         toast.success("Registration Successful!");
// //       })
// //       .addCase(register.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.isError = true;
// //         state.message = action.payload;
// //         state.user = null;
// //         state.token = null;
// //         toast.error(action.payload);
// //       })

// //       // Login
// //       .addCase(login.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(login.fulfilled, (state, action) => {
// //         state.isLoading = false;
// //         state.isSuccess = true;
// //         state.user = action.payload.user;
// //         state.token = action.payload.token;
// //         toast.success("Login Successful!");
// //       })
// //       .addCase(login.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.isError = true;
// //         state.message = action.payload;
// //         state.user = null;
// //         state.token = null;
// //         toast.error(action.payload);
// //       })

// //       // Admin Login
// //       .addCase(loginAdmin.pending, (state) => {
// //         state.isLoading = true;
// //       })
// //       .addCase(loginAdmin.fulfilled, (state, action) => {
// //         state.isLoading = false;
// //         state.isSuccess = true;
// //         state.user = action.payload.user;
// //         state.token = action.payload.token;

// //         localStorage.setItem("adminToken", action.payload.token);
// //   localStorage.setItem("adminUser", JSON.stringify(action.payload.user));

// //         toast.success("Admin Login Successful!");
// //       })
// //       .addCase(loginAdmin.rejected, (state, action) => {
// //         state.isLoading = false;
// //         state.isError = true;
// //         state.message = action.payload;
// //         state.user = null;
// //         state.token = null;
// //         toast.error(action.payload);
// //       });
// //   },
// // });

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     RESET(state) {
//       state.isError = false;
//       state.isSuccess = false;
//       state.isLoading = false;
//       state.message = "";
//     },
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       localStorage.removeItem("user");
//       localStorage.removeItem("token");
//     },
//   },
//   extraReducers: (builder) => {
//     const handlePending = (state) => { state.isLoading = true; };
//     const handleRejected = (state, action) => {
//       state.isLoading = false;
//       state.isError = true;
//       state.message = action.payload;
//       state.user = null;
//       state.token = null;
//       toast.error(action.payload);
//     };
//     const handleFulfilled = (state, action) => {
//       state.isLoading = false;
//       state.isSuccess = true;
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       // No need to save to localStorage here, the thunk already does it.
//     };

//     builder
//       // Register
//       .addCase(register.pending, handlePending)
//       .addCase(register.fulfilled, (state, action) => {
//         handleFulfilled(state, action);
//         toast.success("Registration Successful!");
//       })
//       .addCase(register.rejected, handleRejected)
//       // Login
//       .addCase(login.pending, handlePending)
//       .addCase(login.fulfilled, (state, action) => {
//         handleFulfilled(state, action);
//         toast.success("Login Successful!");
//       })
//       .addCase(login.rejected, handleRejected)
//       // Admin Login
//       .addCase(loginAdmin.pending, handlePending)
//       .addCase(loginAdmin.fulfilled, (state, action) => {
//         handleFulfilled(state, action);
//         toast.success("Admin Login Successful!");
//       })
//       .addCase(loginAdmin.rejected, handleRejected);
//   },
// });

// export const { RESET, logout } = authSlice.actions;
// export default authSlice.reducer;
