import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/ui/login-form";
import { Truck, ShieldCheck, Star } from "lucide-react";

export default function LoginPage() {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(user?.role === "CUSTOMER" ? "/shop" : "/dashboard", { replace: true });
        }
    }, [isAuthenticated, user?.role, navigate]);

    if (isAuthenticated) return null;

    const handleLogin = async (email: string, password: string) => {
        setError(null);
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Invalid email or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="w-full h-screen flex flex-col md:flex-row overflow-hidden bg-[#0A0A0A]">
            {/* LEFT PANEL — Brand Visual */}
            <div className="hidden md:flex relative w-[55%] h-full bg-[#0A0A0A] items-center justify-center overflow-hidden border-r border-gray-900">
                {/* Large decorative red glow blob behind everything */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-96 h-96 bg-red-600 rounded-full opacity-10 blur-3xl" />
                </div>

                {/* Floating geometric shapes */}
                <div className="absolute top-1/4 left-1/4 w-16 h-16 border-2 border-red-600 rounded-full opacity-15 animate-float" />
                <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-red-600 rounded-sm opacity-10 rotate-45 animate-float-reverse" />
                <div className="absolute bottom-1/3 left-1/3 w-24 h-24 border border-red-800 rounded-full opacity-10 animate-float-slow" />
                <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-red-500 rounded-full opacity-20 animate-float" />

                {/* Main brand content */}
                <div className="relative z-10 text-center flex flex-col items-center">
                    <h1 className="text-8xl font-black tracking-tighter leading-none">
                        <span className="text-red-600">ZY</span>
                        <span className="text-white">VORA</span>
                    </h1>
                    <p className="text-gray-500 text-lg italic mt-4 tracking-wide">
                        Everything You Need, Delivered Smart.
                    </p>

                    <div className="mt-8 flex gap-3 flex-wrap justify-center">
                        <div className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-gray-400 text-xs flex items-center gap-2">
                            <Truck size={12} className="text-red-600" /> Free Shipping
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-gray-400 text-xs flex items-center gap-2">
                            <ShieldCheck size={12} className="text-red-600" /> Secure Checkout
                        </div>
                        <div className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 text-gray-400 text-xs flex items-center gap-2">
                            <Star size={12} className="text-red-600" /> Top Rated
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-8">
                    <p className="text-gray-800 text-xs">© 2026 Zyvora</p>
                </div>
            </div>

            {/* RIGHT PANEL — Login Form */}
            <div className="relative w-full md:w-[45%] h-screen bg-[#111111] flex items-center justify-center">
                <LoginForm
                    onSubmit={handleLogin}
                    error={error}
                    isSubmitting={isSubmitting}
                />

                <div className="absolute bottom-6 w-full text-center">
                    <p className="text-gray-700 text-xs">
                        Zyvora — Everything You Need, Delivered Smart © 2026
                    </p>
                </div>
            </div>
        </main>
    );
}
