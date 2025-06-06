"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import { AuthToken } from "@/lib/api/types/auth";
import {
  APIError,
  APIResponse,
  getMe,
  loginByEmail,
  loginByUsername,
} from "@/lib/api/client";
import { toast } from "sonner";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/auth";
import { User } from "@/lib/api/types/user";

interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export default function LoginPage() {
  const [emailFormData, setEmailFormData] = useState({
    email: "",
    password: "",
  });
  const [usernameFormData, setUsernameFormData] = useState({
    username: "",
    password: "",
  });
  const [isOk, setIsOk] = useState(false);
  const queryClient = useQueryClient();
  const auth = useAuth();

  if (auth.isAuthorized) {
    redirect("/dashboard");
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthToken> => {
      let response: APIResponse<AuthToken | APIError>;
      if (credentials.email) {
        response = await loginByEmail({
          email: credentials.email,
          password: credentials.password,
        });
      } else if (credentials.username) {
        response = await loginByUsername({
          username: credentials.username,
          password: credentials.password,
        });
      } else {
        throw new Error("Invalid credentials");
      }

      if (response.statusCode !== 200) {
        throw new Error(
          "message" in response.data ? response.data.message : "Failed to login"
        );
      }

      return response.data as AuthToken;
    },
    onSuccess: async (data) => {
      auth.setToken!(data.access_token);
      const user = await getMe(data.access_token);
      if (user.statusCode !== 200) {
        auth.onLogout!();
        throw new Error(
          "message" in user.data ? user.data.message : "Failed to fetch user"
        );
      }
      auth.setUser!(user.data as User);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Login successful");
      setIsOk(true);
    },
    onError: (error) => {
      toast.error("Login failed. Try again", {
        description: error.message,
      });
    },
  });

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: emailFormData.email,
      password: emailFormData.password,
    });
  };

  const handleUsernameLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      username: usernameFormData.username,
      password: usernameFormData.password,
    });
  };

  if (isOk) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Choose your preferred login method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger
                value="email"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
              >
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger
                value="username"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950"
              >
                <UserIcon className="h-4 w-4" />
                Username
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={emailFormData.email}
                    onChange={(e) =>
                      setEmailFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    disabled={loginMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-password">Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    placeholder="Enter your password"
                    value={emailFormData.password}
                    onChange={(e) =>
                      setEmailFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    disabled={loginMutation.isPending}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in with Email"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="username" className="space-y-4 mt-4">
              <form onSubmit={handleUsernameLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={usernameFormData.username}
                    onChange={(e) =>
                      setUsernameFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                    disabled={loginMutation.isPending}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="username-password"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <Input
                    id="username-password"
                    type="password"
                    placeholder="Enter your password"
                    value={usernameFormData.password}
                    onChange={(e) =>
                      setUsernameFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    disabled={loginMutation.isPending}
                    className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in with Username"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {loginMutation.isError && (
            <Alert
              variant="destructive"
              className="mt-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
            >
              <AlertDescription className="text-red-800 dark:text-red-200">
                {loginMutation.error?.message ||
                  "An error occurred during login"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up
            </a>
          </div>
          <div className="text-sm text-center">
            <a
              href="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Forgot your password?
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
