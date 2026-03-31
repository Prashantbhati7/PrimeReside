"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, useGetAuthUserQuery, useLoginMutation, useLogoutMutation, useSignupMutation } from "@/state/api";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import Cookies from "js-cookie";

interface AuthContextType {
  user: any;
  userRole: string | null;
  isLoaded: boolean;
  isLoggingOut: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [authUser, setauthUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data, isLoading } = useGetAuthUserQuery(undefined, {
    skip: !token,
  });
 
   
  const [loginMutation] = useLoginMutation();
  const [signupMutation] = useSignupMutation();
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken && !token) {
      setToken(savedToken);
    }
  }, [token]);

  useEffect(() => {
    if (data) {
      setauthUser(data);
    }
  }, [data]);

  const login = async (credentials: any) => {
    const result = await loginMutation(credentials).unwrap();
    localStorage.setItem("auth_token", result.token);
    Cookies.set("auth_token", result.token, { expires: 7 });
    
    // Manually trigger the auth user query to ensure it's loaded before we finish
    await dispatch(
      api.endpoints.getAuthUser.initiate(undefined, { subscribe: false, forceRefetch: true }) as any
    ).unwrap();

    setToken(result.token);
    router.push("/");
  };

  const signup = async (credentials: any) => {
    const result = await signupMutation(credentials).unwrap();
    localStorage.setItem("auth_token", result.token);
    Cookies.set("auth_token", result.token, { expires: 7 });
    
    // Manually trigger the auth user query
    await dispatch(
      api.endpoints.getAuthUser.initiate(undefined, { subscribe: false, forceRefetch: true }) as any
    ).unwrap();

    setToken(result.token);
    router.push("/");
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("auth_token");
      Cookies.remove("auth_token");
      setToken(null);
      setauthUser(null);
      dispatch(api.util.invalidateTags(["Auth"]));
      router.push("/");
      setIsLoggingOut(false);
    }
  };

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  
  useEffect(() => {
    if (!isLoading && authUser && isAuthPage) {
      router.push("/");
    }
  }, [authUser, isLoading, isAuthPage, router]);

  const value = {
    user: authUser?.userInfo,
    userRole: authUser?.userRole,
    isLoaded: !isLoading,
    isLoggingOut,
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
