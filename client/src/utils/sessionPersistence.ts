import { loginAdmin, loginSuperAdmin, resetAuthState } from "@/reducer/auth";
import { AuthStorage } from "./authStorage";
import type { AppDispatch } from "@/store";

export const restoreAuthSessions = (dispatch: AppDispatch) => {
  try {
    // First, reset the auth state to ensure clean structure
    dispatch(resetAuthState());
    
    // Restore Admin session
    const adminToken = AuthStorage.admin.getToken();
    const adminUserData = AuthStorage.admin.getUserData();
    
    if (adminToken && adminUserData) {
      dispatch(loginAdmin({
        user: adminUserData,
        token: adminToken
      }));
      return;
    }

    // Restore SuperAdmin session
    const superAdminToken = AuthStorage.superAdmin.getToken();
    const superAdminUserData = AuthStorage.superAdmin.getUserData();
    
    if (superAdminToken && superAdminUserData) {
      dispatch(loginSuperAdmin({
        user: superAdminUserData,
        token: superAdminToken
      }));
      return;
    }

    // Check for legacy storage and migrate
    const legacyToken = AuthStorage.legacy.getToken();
    const legacyUserData = AuthStorage.legacy.getUserData();
    
    if (legacyToken && legacyUserData) {
      // Migrate legacy data to new structure
      if (legacyUserData.role === 'super-admin' || legacyUserData.role === 'superadmin') {
        AuthStorage.superAdmin.setToken(legacyToken);
        AuthStorage.superAdmin.setUserData(legacyUserData);
        dispatch(loginSuperAdmin({
          user: legacyUserData,
          token: legacyToken
        }));
      } else {
        AuthStorage.admin.setToken(legacyToken);
        AuthStorage.admin.setUserData(legacyUserData);
        dispatch(loginAdmin({
          user: legacyUserData,
          token: legacyToken
        }));
      }
      
      // Clear legacy storage after migration
      AuthStorage.legacy.clear();
    }
  } catch (error) {
    console.error('Error restoring auth sessions:', error);
    // If there's any error, reset to clean state
    dispatch(resetAuthState());
    
    // Clear all stored auth data
    AuthStorage.admin.clear();
    AuthStorage.superAdmin.clear();
    AuthStorage.legacy.clear();
  }
};
