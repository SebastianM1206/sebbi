"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast, Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = "Error al iniciar sesión.";
                if (errorData && errorData.detail) {
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail;
                    } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0 && errorData.detail[0].msg) {
                        errorMessage = errorData.detail[0].msg;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            localStorage.setItem("userEmail", email);

            toast.success("Inicio de sesión exitoso", {
                description: "Redirigiendo al dashboard...",
                duration: 3000,
            });

            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);

        } catch (error) {
            toast.error("Credenciales incorrectas, por favor intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex">
            <Toaster richColors position="bottom-right" />
            {/* Lado Izquierdo: Formulario */}
            <div className="flex flex-col justify-center w-full max-w-md px-8 md:px-12 lg:px-16 bg-white">
                <div className="mb-8 flex items-center gap-2">
                    <img src="/sebbi_logo.svg" alt="Sebbi.ai Logo" className="h-12 mb-10" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Login to your account</h1>
                <p className="text-gray-500 mb-6 text-sm">Enter your email below to login to your account</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                        <Input
                            type="email"
                            placeholder="m@example.com"
                            className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm rounded-md h-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <a href="/forgot-password" className="text-xs text-[#2D37CF] hover:text-[#232bc0]">Forgot your password?</a>
                        </div>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 text-sm rounded-md h-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 p-1 focus:outline-none"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full  text-white text-sm font-medium py-2 rounded-md shadow-sm transition-colors duration-150 h-10"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Login'
                        )}
                    </Button>
                </form>



                <p className="text-center text-sm mt-8 text-gray-600">
                    Don't have an account?{' '}
                    <a href="/sign-up" className="text-[#2D37CF] hover:text-[#232bc0] font-medium underline">
                        Sign up
                    </a>
                </p>
            </div>
            {/* Lado Derecho: Visual */}
            <div className="hidden md:block flex-1 bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center h-32 w-32 rounded-full bg-white border-8 border-gray-100 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM3 15l6-6a2 2 0 0 1 2.8 0l6 6" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                        </svg>
                    </div>
                </div>
                {/* Radial lines para el efecto decorativo */}
                <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="absolute origin-center w-px h-screen bg-gray-200"
                            style={{
                                transform: `rotate(${index * 45}deg)`,
                                top: '50%',
                                left: '50%',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 