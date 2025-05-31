"use client";

import { getMe } from "@/lib/api/client";
import { User } from "@/lib/api/types/user";
import { redirect } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export interface AuthContextData {
  token: string | null;
  setToken?: (token: string) => void;
  user?: User;
  setUser?: (user: User) => void;
  isAuthorized: boolean;
  setIsAuthorized?: (isAuthorized: boolean) => void;
  onLogout?: () => void;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  isAuthorized: false,
});

export function AuthContextWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
    setIsAuthorized(!!storedToken);
  }, []);

  const setTokenF = (token: string) => {
    setToken(token);
    setIsAuthorized(true);
    localStorage.setItem("accessToken", token);
  };

  const onLogout = () => {
    setToken(null);
    setIsAuthorized(false);
    localStorage.removeItem("accessToken");
  };

  useEffect(() => {
    const action = async () => {
      if (token) {
        const response = await getMe(token);

        if (response.statusCode === 401) {
          onLogout();
          redirect("/login");
        } else {
          setUser(response.data as User);
        }
      }
    };
    action();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken: setTokenF,
        user,
        isAuthorized,
        setIsAuthorized,
        setUser,
        onLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
