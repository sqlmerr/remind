"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { register } from "@/lib/api/client";
import { RegisterUser } from "@/lib/api/types/auth";
import { User } from "@/lib/api/types/user";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle,
  Loader2,
  Mail,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (credentials: RegisterUser): Promise<User> => {
      const response = await register(credentials);

      if (!(response.statusCode in [200, 201])) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to signup new user"
        );
      }

      return response.data as User;
    },
    onSuccess: (data) => {
      setShowSuccess(true);
      // Reset form
      setFormData({ username: "", email: "", password: "" });

      toast.success("Signup successful");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    },
    onError: (error) => {
      toast.error("Signup failed. Try again", { description: error.message });
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate(formData);
  };

  const handleInputChange =
    (field: keyof RegisterUser) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                Account Created Successfully!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Welcome! Your account has been created. You'll be redirected to
                the login page shortly.
              </p>
              <div className="mt-4">
                <Loader2 className="mx-auto h-4 w-4 animate-spin text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                disabled={signupMutation.isPending}
                minLength={3}
                maxLength={20}
                pattern="^[a-zA-Z0-9_]+$"
                title="Username must be 3-20 characters and contain only letters, numbers, and underscores"
              />
              <p className="text-xs text-gray-500">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange("email")}
                required
                disabled={signupMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange("password")}
                required
                disabled={signupMutation.isPending}
                minLength={8}
                title="Password must be at least 8 characters long"
              />
              <p className="text-xs text-gray-500">Minimum 8 characters</p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {signupMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>
                {signupMutation.error?.message ||
                  "An error occurred during signup"}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Terms</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-600 text-center">
              By creating an account, you agree to our{" "}
              <a
                href="/terms"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
