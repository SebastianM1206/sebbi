"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Card className="w-full max-w-md p-8 border-0 shadow-none">
        <h1 className="text-3xl font-bold text-center mb-2">Sebbi.ai</h1>
        <h2 className="text-2xl font-semibold text-center mb-4">
          Sign in to Sebbi
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-base font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="Enter your email address"
              className="text-base"
            />
          </div>
          <div>
            <label className="block text-base font-medium mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Please enter your password"
                className="text-base"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>
          <Button className="w-full mt-6">Sign In</Button>
        </form>
        <p className="text-center text-base mt-2">
          Or{" "}
          <a href="/sign-up" className="underline">
            sign up instead
          </a>
        </p>
        <p className="text-sm text-center text-gray-500 mt-4">
          By proceeding you acknowledge that you have read, understood and agree
          to our{" "}
          <a
            href="https://github.com/SebastianM1206/sebbi"
            className="underline"
          >
            Terms of Service
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
