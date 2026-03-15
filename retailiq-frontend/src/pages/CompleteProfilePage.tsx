import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { getAccessToken } from "@/context/AuthContext";
import { SmokeyBackground } from "@/components/ui/login-form";
import { Phone, MapPin, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const schema = z.object({
    phone:      z.string().min(9,  "Please enter a valid phone number"),
    address:    z.string().min(5,  "Address must be at least 5 characters"),
    postalCode: z.string().min(3,  "Please enter a valid postal code"),
});

type ProfileForm = z.infer<typeof schema>;

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export default function CompleteProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const [success, setSuccess]         = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<ProfileForm>({ resolver: zodResolver(schema) });

    const onSubmit = async (data: ProfileForm) => {
        setServerError("");
        try {
            await axios.put(`${API_BASE}/profile`, data, {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
            });
            setSuccess(true);
            setTimeout(() => navigate("/shop"), 1800);
        } catch (err: any) {
            setServerError(err?.response?.data?.message || "Could not save profile. Please try again.");
        }
    };

    return (
        <main className="relative w-screen min-h-screen bg-gray-950 overflow-hidden flex items-center justify-center p-4">
            <SmokeyBackground className="absolute inset-0" color="#DC2626" backdropBlurAmount="sm" />

            <div className="relative z-10 w-full max-w-sm">
                <div className="w-full p-8 space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-3">
                            <div className="h-16 w-16 rounded-2xl bg-[#DC2626]/80 backdrop-blur-md flex items-center justify-center shadow-2xl ring-1 ring-red-400/30">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Complete Profile</h2>
                        <p className="text-sm text-gray-300">
                            Welcome, <span className="text-[#DC2626] font-bold">{user?.firstName || "there"}</span>! 
                            Add your contact details to finish setting up.
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-[#DC2626] h-1.5 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: success ? "100%" : "50%" }} />
                    </div>
                    <p className="text-center text-xs text-gray-400 -mt-3">Step 2 of 2</p>

                    {/* Success state */}
                    {success ? (
                        <div className="text-center py-6 space-y-3">
                            <CheckCircle2 className="h-12 w-12 text-[#16A34A] mx-auto animate-bounce" />
                            <p className="text-white font-semibold">Profile saved! Redirecting…</p>
                        </div>
                    ) : (
                        <>
                            {/* Server error */}
                            {serverError && (
                                <div className="bg-red-500/20 border border-red-400/40 text-red-300 text-sm rounded-lg px-4 py-3">
                                    {serverError}
                                </div>
                            )}

                            <form className="space-y-7" onSubmit={handleSubmit(onSubmit)} noValidate>
                                {/* Phone */}
                                <div className="relative z-0">
                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder=" "
                                        autoComplete="tel"
                                        {...register("phone")}
                                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                                    />
                                    <label htmlFor="phone" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                        <Phone className="inline-block mr-2 -mt-0.5" size={12} />
                                        Phone Number
                                    </label>
                                    {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                                </div>

                                {/* Address */}
                                <div className="relative z-0">
                                    <input
                                        id="address"
                                        type="text"
                                        placeholder=" "
                                        autoComplete="street-address"
                                        {...register("address")}
                                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                                    />
                                    <label htmlFor="address" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                        <MapPin className="inline-block mr-2 -mt-0.5" size={12} />
                                        Address
                                    </label>
                                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
                                </div>

                                {/* Postal Code */}
                                <div className="relative z-0">
                                    <input
                                        id="postalCode"
                                        type="text"
                                        placeholder=" "
                                        autoComplete="postal-code"
                                        {...register("postalCode")}
                                        className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-400/50 appearance-none focus:outline-none focus:ring-0 focus:border-[#DC2626] peer"
                                    />
                                    <label htmlFor="postalCode" className="absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-[#DC2626] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 uppercase tracking-widest font-bold">
                                        <Mail className="inline-block mr-2 -mt-0.5" size={12} />
                                        Postal Code
                                    </label>
                                    {errors.postalCode && <p className="text-xs text-red-400 mt-1">{errors.postalCode.message}</p>}
                                </div>

                                {/* Buttons */}
                                <div className="space-y-3">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="group w-full flex items-center justify-center gap-2 py-4 px-4 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 rounded-xl text-white font-black tracking-widest uppercase focus:outline-none transition-all duration-300 shadow-lg shadow-red-900/40"
                                    >
                                        {isSubmitting ? "SAVING…" : "SAVE & CONTINUE"}
                                        {!isSubmitting && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => navigate("/shop")}
                                        className="w-full py-2.5 px-4 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Skip for now →
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-500 z-10 font-medium">
                Zyvora — Everything You Need, Delivered Smart © 2026
            </p>
        </main>
    );
}
