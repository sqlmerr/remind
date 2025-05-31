"use client";

import { useAuth } from "@/context/auth";
import { redirect } from "next/navigation";

export default function Home() {
  const auth = useAuth();
  if (auth.isAuthorized) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
