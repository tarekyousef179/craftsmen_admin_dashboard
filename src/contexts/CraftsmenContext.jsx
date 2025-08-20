import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "../utils/axios";

const CraftsmenContext = createContext();

export const useCraftsmenContext = () => {
  const context = useContext(CraftsmenContext);
  if (!context) {
    throw new Error(
      "useCraftsmenContext must be used within a CraftsmenProvider"
    );
  }
  return context;
};

export const CraftsmenProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const updateVerificationStatus = useCallback(
    async (craftsmanId, action) => {
      try {
        if (action === "approve") {
          await axios.post(`/admin/verifications/${craftsmanId}/approve`);
        } else if (action === "reject") {
          await axios.post(`/admin/verifications/${craftsmanId}/reject`);
        }
        // Trigger refresh for all components
        triggerRefresh();
        return { success: true };
      } catch (error) {
        console.error(`Error ${action}ing verification:`, error);
        return { success: false, error: error.message };
      }
    },
    [triggerRefresh]
  );

  const value = {
    refreshTrigger,
    triggerRefresh,
    updateVerificationStatus,
  };

  return (
    <CraftsmenContext.Provider value={value}>
      {children}
    </CraftsmenContext.Provider>
  );
};
