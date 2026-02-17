import { createContext, useContext } from "react";
import { UserResponse } from "~/models/system";

interface SessionContextValue extends UserResponse {}

export const SessionContext = createContext<SessionContextValue | null>(null);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SessionContextValue;
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
