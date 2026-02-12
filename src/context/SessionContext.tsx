import { createContext, useContext } from "react";

export interface SessionContextValue {
  name: string;
  email: string;
  account_icon: string | null;
  account_status: string;
  account_role: string;
}

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
