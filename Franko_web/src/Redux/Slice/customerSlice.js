import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Thin wrapper (your localStorage is already patched to encrypt/decrypt + JSON parse)
const secureStorage = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};

// Create a new customer
export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/Users/Customer-Post`,
        customerData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An unknown error occurred.");
    }
  }
);

// Fetch all customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Users/Customer-Get`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An unknown error occurred.");
    }
  }
);

// Get customer by contact number
export const getCustomerById = createAsyncThunk(
  "customers/getCustomerById",
  async (contactNumber, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Users/GetCustomerById?contactNumber=${contactNumber}`
      );

      const data = Array.isArray(response.data) ? response.data[0] : response.data;

      if (!data || !data.contactNumber) {
        return rejectWithValue("No customer found with that contact number.");
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          "An unknown error occurred while fetching the customer."
      );
    }
  }
);

// Customer login
export const loginCustomer = createAsyncThunk(
  "customers/loginCustomer",
  async ({ contactNumber, password }, { dispatch, rejectWithValue }) => {
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/Users/CustomerLogin`, {
        contactNumber,
        password,
        FullName: "N/A",
      });

      const loginData = loginResponse.data;

      if (loginData?.ResponseCode !== "1") {
        return rejectWithValue(
          loginData?.ResponseMessage || "Login failed. Invalid credentials."
        );
      }

      const customer = await dispatch(getCustomerById(contactNumber)).unwrap();

      // ✅ FIX: store object directly (patch will stringify/encrypt)
      secureStorage.set("customer", customer);

      return customer;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "An unknown error occurred during login."
      );
    }
  }
);

// Update account status (deactivate)
export const updateAccountStatus = createAsyncThunk(
  "customers/updateAccountStatus",
  async (_, { rejectWithValue }) => {
    try {
      // ✅ FIX: this returns an object (due to patched getItem)
      const customer = secureStorage.get("customer");

      if (!customer) return rejectWithValue("No customer found.");

      const { customerAccountNumber } = customer;
      if (!customerAccountNumber) return rejectWithValue("Invalid customer data.");

      const response = await axios.post(`${API_BASE_URL}/Users/Customer-Status`, {
        accountNumber: customerAccountNumber,
        accountStatus: "0",
      });

      secureStorage.remove("customer");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update account status.");
    }
  }
);

const initialState = {
  // ✅ FIX: already parsed object (or null)
  currentCustomer: secureStorage.get("customer") || null,
  currentCustomerDetails: secureStorage.get("customer") || null,
  customerList: [],
  loading: false,
  error: null,
  status: "idle",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    logoutCustomer: (state) => {
      state.currentCustomer = null;
      state.currentCustomerDetails = null;
      secureStorage.remove("customer");
    },

    clearCustomers: (state) => {
      state.customerList = [];
    },

    setCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },

    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },

    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
      state.currentCustomerDetails = action.payload;
      if (action.payload) {
        // ✅ FIX: store object directly
        secureStorage.set("customer", action.payload);
      } else {
        secureStorage.remove("customer");
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;

        const { ResponseCode } = action.payload || {};

        if (ResponseCode === "1") {
          const customer = { ...action.meta.arg, ...action.payload };
          state.currentCustomer = customer;
          state.currentCustomerDetails = customer;

          // ✅ FIX: store object directly
          secureStorage.set("customer", customer);
        } else {
          state.error =
            action.payload?.ResponseMessage ||
            "Account creation failed. Invalid server response.";
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "An unknown error occurred.";
      })

      // FETCH
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customerList = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || "An unknown error occurred.";
      })

      // GET BY ID
      .addCase(getCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomerDetails = action.payload;
      })
      .addCase(getCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.currentCustomerDetails = action.payload;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed.";
      })

      // UPDATE STATUS
      .addCase(updateAccountStatus.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateAccountStatus.fulfilled, (state) => {
        state.status = "succeeded";
        state.currentCustomer = null;
        state.currentCustomerDetails = null;
      })
      .addCase(updateAccountStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update account status.";
      });
  },
});

export const {
  logoutCustomer,
  clearCustomers,
  setCustomer,
  clearSelectedCustomer,
  setCurrentCustomer,
} = customerSlice.actions;

export default customerSlice.reducer;