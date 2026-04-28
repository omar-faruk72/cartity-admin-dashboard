"use client";

import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useAuth } from "../context/authContext";
import LoadingPage from "./LoadingPage";

interface ProtectedRouteProps {
  children: ReactNode;
  allowRoles?: ("admin" | "user")[];
}

const ProtectedRoute = ({ children, allowRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
  
    if (!loading && !user) {
      router.push("/login");
    }


    if (!loading && user && allowRoles && !allowRoles.includes(user.role)) {
      router.push("/"); 
    }
  }, [user, loading, router, allowRoles]);


  if (loading || !user || (allowRoles && !allowRoles.includes(user.role))) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;