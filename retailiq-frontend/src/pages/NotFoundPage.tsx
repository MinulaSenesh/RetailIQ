import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const handleHome = () => {
        if (!isAuthenticated) navigate("/login");
        else if (user?.role === "CUSTOMER") navigate("/shop");
        else navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="text-[120px] font-black text-white leading-none tracking-tighter">
                    4<span className="text-[#DC2626]">0</span>4
                </div>
                <h2 className="text-2xl font-bold text-white mt-4 mb-2">Page Not Found</h2>
                <p className="text-gray-400 mb-10 max-w-sm mx-auto">
                    The page you are looking for does not exist or has been moved.
                </p>
                <button
                    onClick={handleHome}
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#DC2626]/20"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
