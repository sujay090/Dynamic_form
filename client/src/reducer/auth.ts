// store/authSlice.ts
import type { User } from "@/utils/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// adjust the path as needed

export interface AuthState {
  // Admin session
  admin: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
  // SuperAdmin session  
  superAdmin: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
  // Current active session
  currentSession: 'admin' | 'superAdmin' | null;
  
  // Legacy support for backward compatibility
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
}

const initialState: AuthState = {
  admin: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  superAdmin: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  currentSession: null,
  
  // Legacy fields
  isAuthenticated: false,
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Admin login
    loginAdmin: (state, action: PayloadAction<{ user: User; token: string }>) => {
      console.log("🔄 Redux loginAdmin called with:", action.payload);
      
      // Ensure state structure exists
      if (!state.admin) {
        state.admin = { isAuthenticated: false, user: null, token: null };
      }
      
      state.admin.isAuthenticated = true;
      state.admin.user = action.payload.user;
      state.admin.token = action.payload.token;
      state.currentSession = 'admin';
      
      // Update legacy fields for backward compatibility
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
      
      console.log("✅ Redux admin state updated:", { 
        admin: state.admin, 
        currentSession: state.currentSession,
        legacy: { isAuthenticated: state.isAuthenticated, role: state.role }
      });
    },
    
    // SuperAdmin login
    loginSuperAdmin: (state, action: PayloadAction<{ user: User; token: string }>) => {
      // Ensure state structure exists
      if (!state.superAdmin) {
        state.superAdmin = { isAuthenticated: false, user: null, token: null };
      }
      
      state.superAdmin.isAuthenticated = true;
      state.superAdmin.user = action.payload.user;
      state.superAdmin.token = action.payload.token;
      state.currentSession = 'superAdmin';
      
      // Update legacy fields for backward compatibility
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.role = action.payload.user.role;
    },
    
    // Admin logout
    logoutAdmin: (state) => {
      // Ensure state structure exists
      if (!state.admin) {
        state.admin = { isAuthenticated: false, user: null, token: null };
      }
      if (!state.superAdmin) {
        state.superAdmin = { isAuthenticated: false, user: null, token: null };
      }
      
      state.admin.isAuthenticated = false;
      state.admin.user = null;
      state.admin.token = null;
      
      if (state.currentSession === 'admin') {
        if (state.superAdmin.isAuthenticated) {
          state.currentSession = 'superAdmin';
          // Update legacy fields to superAdmin
          state.isAuthenticated = true;
          state.user = state.superAdmin.user;
          state.role = state.superAdmin.user?.role || null;
        } else {
          state.currentSession = null;
          // Clear legacy fields
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
        }
      }
    },
    
    // SuperAdmin logout
    logoutSuperAdmin: (state) => {
      // Ensure state structure exists
      if (!state.admin) {
        state.admin = { isAuthenticated: false, user: null, token: null };
      }
      if (!state.superAdmin) {
        state.superAdmin = { isAuthenticated: false, user: null, token: null };
      }
      
      state.superAdmin.isAuthenticated = false;
      state.superAdmin.user = null;
      state.superAdmin.token = null;
      
      if (state.currentSession === 'superAdmin') {
        if (state.admin.isAuthenticated) {
          state.currentSession = 'admin';
          // Update legacy fields to admin
          state.isAuthenticated = true;
          state.user = state.admin.user;
          state.role = state.admin.user?.role || null;
        } else {
          state.currentSession = null;
          // Clear legacy fields
          state.isAuthenticated = false;
          state.user = null;
          state.role = null;
        }
      }
    },
    
    // Set current active session
    setCurrentSession: (state, action: PayloadAction<'admin' | 'superAdmin' | null>) => {
      // Ensure state structure exists
      if (!state.admin) {
        state.admin = { isAuthenticated: false, user: null, token: null };
      }
      if (!state.superAdmin) {
        state.superAdmin = { isAuthenticated: false, user: null, token: null };
      }
      
      state.currentSession = action.payload;
      
      if (action.payload === 'admin' && state.admin.isAuthenticated) {
        state.isAuthenticated = true;
        state.user = state.admin.user;
        state.role = state.admin.user?.role || null;
      } else if (action.payload === 'superAdmin' && state.superAdmin.isAuthenticated) {
        state.isAuthenticated = true;
        state.user = state.superAdmin.user;
        state.role = state.superAdmin.user?.role || null;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
      }
    },
    
    // Reset state structure (migration helper)
    resetAuthState: (state) => {
      return {
        admin: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
        superAdmin: {
          isAuthenticated: false,
          user: null,
          token: null,
        },
        currentSession: null,
        isAuthenticated: false,
        user: null,
        role: null,
      };
    },
    
    // Legacy login (for backward compatibility)
    login: (
      state,
      action: PayloadAction<{
        isAuthenticated: boolean;
        user: User;
        role: string;
      }>
    ) => {
      const { user, role } = action.payload;
      
      // Ensure state structure exists
      if (!state.admin) {
        state.admin = { isAuthenticated: false, user: null, token: null };
      }
      if (!state.superAdmin) {
        state.superAdmin = { isAuthenticated: false, user: null, token: null };
      }
      
      if (role === 'super-admin' || role === 'superadmin') {
        state.superAdmin.isAuthenticated = true;
        state.superAdmin.user = user;
        state.superAdmin.token = 'legacy-token';
        state.currentSession = 'superAdmin';
      } else {
        state.admin.isAuthenticated = true;
        state.admin.user = user;
        state.admin.token = 'legacy-token';
        state.currentSession = 'admin';
      }
      
      // Update legacy fields
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = user;
      state.role = role;
    },
    
    // Legacy logout (for backward compatibility)
    logout: (state) => {
      state.admin = {
        isAuthenticated: false,
        user: null,
        token: null,
      };
      state.superAdmin = {
        isAuthenticated: false,
        user: null,
        token: null,
      };
      state.currentSession = null;
      
      // Clear legacy fields
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
    },
  },
});

export const { 
  loginAdmin, 
  loginSuperAdmin, 
  logoutAdmin, 
  logoutSuperAdmin, 
  setCurrentSession,
  resetAuthState,
  login, 
  logout 
} = authSlice.actions;
export default authSlice.reducer;
