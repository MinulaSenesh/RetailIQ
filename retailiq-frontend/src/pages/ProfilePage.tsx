// src/pages/ProfilePage.tsx
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { User, Camera, Loader2, Save, Phone, MapPin, Mail, Shield, Monitor } from "lucide-react";
import { useState } from "react";

const profileSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .refine(val => val === "" || val.length >= 8, {
            message: "Password must be at least 8 characters if provided",
        }),
    phone:      z.string().optional(),
    address:    z.string().optional(),
    postalCode: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const isAdmin = user?.role !== "CUSTOMER";
    const fileInputRef = useRef<HTMLInputElement>(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            password: "",
            phone: user?.phone || "",
            address: user?.address || "",
            postalCode: user?.postalCode || "",
        },
    });

    const onSubmit = async (data: ProfileForm) => {
        setServerError("");
        setSuccessMsg("");
        try {
            const response = await axios.put(`${API_BASE}/profile`, data);
            setSuccessMsg("Profile updated successfully!");
            setTimeout(() => setSuccessMsg(""), 2000);
            reset({ ...data, password: "" });
            if (response.data?.data) {
                updateUser(response.data.data);
            }
        } catch (error: any) {
            setServerError(error?.response?.data?.message || "Failed to update profile.");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setServerError("Please select a valid image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setServerError("Image must be smaller than 5MB.");
            return;
        }

        const formDataFile = new FormData();
        formDataFile.append("file", file);
        setIsUploading(true);
        setServerError("");
        try {
            const response = await axios.post(`${API_BASE}/profile/photo`, formDataFile);
            const newAvatarUrl = response.data?.data;
            if (newAvatarUrl) {
                updateUser({ avatarUrl: newAvatarUrl });
                setSuccessMsg("Profile photo updated!");
                setTimeout(() => setSuccessMsg(""), 2000);
            }
        } catch {
            setServerError("Upload failed. Please try a smaller image.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Profile Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account information and preferences.</p>
                </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {serverError && (
                    <Alert variant="destructive">
                        <AlertDescription>{serverError}</AlertDescription>
                    </Alert>
                )}
                {successMsg && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        <AlertDescription>{successMsg}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Avatar Section */}
                    <Card className="md:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                        <CardHeader className="items-center pb-2 p-0">
                            <CardTitle className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest">Profile Photo</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4 py-8">
                            <div className="relative group">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl ring-2 ring-[#0A0A0A]/10 transition-transform duration-500 group-hover:scale-105">
                                    <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                                    <AvatarFallback className={`text-3xl font-black ${isAdmin ? "bg-primary text-primary-foreground" : "bg-[#DC2626] text-white"}`}>
                                        {user?.firstName?.[0] || user?.username?.[0] || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className={`absolute bottom-1 right-1 rounded-full shadow-lg border-2 border-white text-white transition-all hover:scale-110 active:scale-95 ${isAdmin ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-red-600 hover:bg-red-700"}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    type="button"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 text-xl tracking-tight">{user?.firstName} {user?.lastName}</h3>
                                <p className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mt-3 inline-block hidden">
                                    {user?.role}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 font-medium text-center">JPG or PNG · MAX 5MB</p>
                        </CardContent>
                    </Card>

                    {/* Personal Info Section */}
                    <Card className="md:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-gray-900 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                <User className={`w-5 h-5 ${isAdmin ? "text-primary" : "text-red-600"}`} />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">First Name</Label>
                                    <input
                                        id="firstName"
                                        placeholder="John"
                                        autoComplete="given-name"
                                        {...register("firstName")}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 admin-input"
                                    />
                                    {errors.firstName && <p className="text-xs text-red-600 font-medium mt-1">{errors.firstName.message}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Last Name</Label>
                                    <input
                                        id="lastName"
                                        placeholder="Doe"
                                        autoComplete="family-name"
                                        {...register("lastName")}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 admin-input"
                                    />
                                    {errors.lastName && <p className="text-xs text-red-600 font-medium mt-1">{errors.lastName.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Email Address</Label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...register("email")}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 admin-input"
                                />
                                {errors.email && <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">New Password</Label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Leave blank to keep current password"
                                    autoComplete="new-password"
                                    {...register("password")}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 admin-input"
                                />
                                {errors.password && <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Details (Customer) or Security Settings (Admin) */}
                    {isAdmin ? (
                        <Card className="md:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${twoFAEnabled ? "text-green-600" : "text-gray-400"}`}>
                                            {twoFAEnabled ? "Enabled" : "Disabled"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${twoFAEnabled ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${twoFAEnabled ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Monitor className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Active Session</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Current device · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">Account Role</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Your permission level in the system</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">{user?.role}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="md:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-red-600" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-1">
                                    <Label htmlFor="phone" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Phone Number</Label>
                                    <input id="phone" type="tel" placeholder="07XXXXXXXX" autoComplete="tel" {...register("phone")}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label htmlFor="address" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Shipping Address</Label>
                                    <input id="address" type="text" placeholder="123 Main Street, Colombo" autoComplete="street-address" {...register("address")}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="postalCode" className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1 block">Postal Code</Label>
                                    <input id="postalCode" type="text" placeholder="00100" autoComplete="postal-code" {...register("postalCode")}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting} className={isAdmin ? "bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl" : "bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl"}>
                        {isSubmitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save Changes</>)}
                    </Button>
                </div>
            </form>
            </div>
        </div>
    );
};
