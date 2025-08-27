import { createContext, useContext } from "react";

export const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  return (
    <ApiContext.Provider value={{ apiBaseUrl }}>{children}</ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
