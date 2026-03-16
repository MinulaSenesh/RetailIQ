import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SmokeyBackground } from "@/components/ui/login-form";

const schema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName:  z.string().min(2, "Last name must be at least 2 characters"),
    email:     z.string().email("Please enter a valid email address"),
    password:  z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError]   = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<RegisterForm>({ resolver: zodResolver(schema) });

    const onSubmit = async ({ firstName, lastName, email, password }: RegisterForm) => {
        setServerError("");
        try {
            await registerUser(firstName, lastName, email, password);
            navigate("/shop");
        } catch (err: any) {
            setServerError(err.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <main className="relative w-screen min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center p-4">
            <SmokeyBackground className="absolute inset-0" color="#7F1D1D" backdropBlurAmount="sm" />

            <div className="relative z-10 w-full max-w-sm">
                {/* Card */}
                <div className="w-full p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-3">
                            <div className="h-16 w-16 rounded-2xl bg-[#DC2626]/80 backdrop-blur-md flex items-center justify-center shadow-2xl ring-1 ring-red-400/30">
                                <UserPlus className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Create Account</h2>
                        <p className="text-sm text-gray-300">Join <span className="text-[#DC2626] font-bold">Zyvora</span> today</p>
                    </div>

                    {/* Server error */}
                    {serverError && (
                        <div className="bg-red-500/20 border border-red-400/40 text-red-300 text-sm rounded-lg px-4 py-3">
                            {serverError}
                        </div>
                    )}

                    <form className="space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* First + Last Name side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative z-0">
                                <input
                                    id="firstName"
                                    type="text"
                                    placeholder=" "
                                    autoComplete="given-name"
                                    {...register("firstName")}
                                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                                />
                                <label htmlFor="firstName" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                    First Name
                                </label>
                                {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="relative z-0">
                                <input
                                    id="lastName"
                                    type="text"
                                    placeholder=" "
                                    autoComplete="family-name"
                                    {...register("lastName")}
                                    className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                                />
                                <label htmlFor="lastName" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                    Last Name
                                </label>
                                {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative z-0">
                            <input
                                id="email"
                                type="email"
                                placeholder=" "
                                autoComplete="email"
                                {...register("email")}
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                            />
                            <label htmlFor="email" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                Email Address
                            </label>
                            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="relative z-0">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder=" "
                                autoComplete="new-password"
                                {...register("password")}
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer pr-7"
                            />
                            <label htmlFor="password" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                Password
                            </label>
                            <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-3 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="relative z-0">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder=" "
                                autoComplete="new-password"
                                {...register("confirmPassword")}
                                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer pr-7"
                            />
                            <label htmlFor="confirmPassword" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                Confirm Password
                            </label>
                            <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-0 top-3 text-gray-400 hover:text-white">
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 rounded-xl text-white font-black tracking-widest uppercase focus:outline-none transition-all duration-300 shadow-lg shadow-red-900/40"
                        >
                            {isSubmitting ? "Creating Account…" : "Create Account"}
                            {!isSubmitting && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400">
                        Already have an account?{" "}
                        <Link to="/login" className="font-bold text-[#DC2626] hover:text-[#B91C1C] transition uppercase tracking-widest">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 z-10 font-medium">
                Zyvora — Everything You Need, Delivered Smart © 2026
            </p>
        </main>
    );
}
