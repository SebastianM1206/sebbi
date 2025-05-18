"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Sebbi.ai</h1>
        <h2 className="text-xl font-semibold text-center mb-6">
          Get started with Sebbi
        </h2>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <Input placeholder="e.g. Tim Cook" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" placeholder="Enter your email address" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Please enter your password"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>
          <Button className="w-full mt-2">Start for free</Button>
        </form>
        <p className="text-center text-sm mt-6">
          Or{" "}
          <a href="/login" className="underline">
            sign in instead
          </a>
        </p>
        <p className="text-xs text-center text-gray-500 mt-4">
          By proceeding you acknowledge that you have read, understood and agree
          to our{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
