"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetAuthUserQuery, useLoginMutation, useSignupMutation } from "@/state/api";
import { useRouter, usePathname } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Cookies from "js-cookie";

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const { data: authUser, isLoading, refetch } = useGetAuthUserQuery(undefined, {
    skip: !token,
  });
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = async (credentials: any) => {
    const result = await loginMutation(credentials).unwrap();
    localStorage.setItem("auth_token", result.token);
    Cookies.set("auth_token", result.token, { expires: 7 });
    setToken(result.token);
    await refetch();
    router.push("/");
  };

  const signup = async (credentials: any) => {
    const result = await signupMutation(credentials).unwrap();
    localStorage.setItem("auth_token", result.token);
    Cookies.set("auth_token", result.token, { expires: 7 });
    setToken(result.token);
    await refetch();
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    Cookies.remove("auth_token");
    setToken(null);
    router.push("/signin");
  };

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  
  useEffect(() => {
    if (!isLoading && authUser && isAuthPage) {
      router.push("/");
    }
  }, [authUser, isLoading, isAuthPage, router]);

  const value = {
    user: authUser?.userInfo,
    isLoaded: !isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
