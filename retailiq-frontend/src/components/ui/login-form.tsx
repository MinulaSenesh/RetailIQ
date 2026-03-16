// src/components/ui/login-form.tsx

import { useState } from "react";
import { ArrowRight, ShoppingBag, Eye, EyeOff, Loader2, Truck, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  error?: string | null;
  isSubmitting?: boolean;
}

export function LoginForm({ onSubmit, error, isSubmitting }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <div className="w-full max-w-sm px-12">
      {/* Refined Luxury Logo */}
      <div className="w-16 h-16 mb-4 flex items-center justify-center mx-auto overflow-hidden rounded-2xl shadow-xl shadow-red-600/20">
        <img src="/zyvora-logo.png" alt="Zyvora Logo" className="w-full h-full object-cover" />
      </div>

      <div className="text-center mt-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
        <p className="text-gray-400 text-sm mt-2">
          Sign in to your <span className="text-red-500 font-semibold">Zyvora</span> account
        </p>
      </div>

      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-400/40 text-red-300 text-xs rounded-lg px-4 py-3 text-center">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Email Address */}
        <div>
          <label className="text-red-600 text-xs font-bold uppercase tracking-widest block mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3.5 text-sm placeholder-gray-600 transition-all duration-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-red-600 text-xs font-bold uppercase tracking-widest block mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3.5 text-sm placeholder-gray-600 transition-all duration-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 cursor-pointer transition-colors"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <span className="text-gray-500 hover:text-red-400 text-xs text-right block mt-1.5 transition-colors cursor-pointer">
            Forgot Password?
          </span>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold uppercase tracking-widest py-4 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-red-900/30 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs uppercase tracking-widest">New here?</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <p className="mt-4 text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-red-500 font-bold hover:text-red-400 cursor-pointer hover:underline transition-colors"
          >
            SIGN UP
          </a>
        </p>
      </form>
    </div>
  );
}

export function SmokeyBackground({ className, color = "#DC2626", backdropBlurAmount = "sm" }: { className?: string; color?: string; backdropBlurAmount?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("pointer-events-none overflow-hidden", className)}>
      <div 
        className={cn(
          "absolute inset-0 opacity-20",
          backdropBlurAmount === "sm" && "backdrop-blur-sm",
          backdropBlurAmount === "md" && "backdrop-blur-md",
          backdropBlurAmount === "lg" && "backdrop-blur-lg"
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
