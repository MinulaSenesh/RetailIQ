import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, LogOut, Search, Twitter, Instagram, Facebook, Home, User, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { productService } from "@/api/products";
import { Product } from "@/types";
import { getAvatarUrl } from "@/lib/formatters";

export default function StorefrontLayout() {
    const { logout, user } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [navSearch, setNavSearch] = useState("");
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        productService.getAll(0, 500).then((res) => {
            const data = (res as any)?.data?.content || (res as any)?.content || (res as any)?.data || [];
            setAllProducts(data.filter((p: Product) => p.active && p.stockQuantity > 0));
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNavSearch(val);
        if (val.trim().length >= 2) {
            const q = val.toLowerCase();
            const matched = allProducts
                .filter(p => p.productName.toLowerCase().includes(q))
                .slice(0, 6);
            setSuggestions(matched);
            setShowSuggestions(matched.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (product: Product) => {
        setNavSearch(product.productName);
        setShowSuggestions(false);
        navigate(`/shop?search=${encodeURIComponent(product.productName)}`);
    };

    const handleNavSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && navSearch.trim()) {
            navigate(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
        }
    };

    useEffect(() => {
        if (!location.pathname.includes("/shop") || location.pathname !== "/shop") {
            setNavSearch("");
        }
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Announcement bar ABOVE navbar */}
            <div className="bg-gradient-to-r from-[#DC2626] to-[#7F1D1D] text-white text-center text-xs py-2.5 font-medium tracking-wide">
                ⚡ FREE SHIPPING on all orders over LKR 5,000 — Limited time offer!
            </div>

            {/* Main header / Navbar */}
            <header className="sticky top-0 z-50 bg-[#0A0A0A] text-white">
                {/* Mobile Search Overlay */}
                {mobileSearchOpen && (
                    <div ref={mobileSearchRef} className="md:hidden absolute top-0 left-0 right-0 z-50 bg-[#0A0A0A] px-4 h-16 flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search premium products..."
                                value={navSearch}
                                onChange={handleNavSearchChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && navSearch.trim()) {
                                        setMobileSearchOpen(false);
                                        navigate(`/shop?search=${encodeURIComponent(navSearch.trim())}`);
                                    }
                                }}
                                className="w-full bg-white text-black pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
                            />
                            {showSuggestions && (
                                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                                    {suggestions.map((product) => (
                                        <li
                                            key={product.productId}
                                            onMouseDown={() => { handleSuggestionClick(product); setMobileSearchOpen(false); }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-0"
                                        >
                                            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span className="text-sm text-gray-800 truncate">{product.productName}</span>
                                            <span className="ml-auto text-xs text-gray-400 shrink-0">{product.category?.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button onClick={() => { setMobileSearchOpen(false); setNavSearch(""); setShowSuggestions(false); }} className="text-white p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/shop" className="flex items-center gap-2 group shrink-0">
                        <img src="/zyvora-logo.png" alt="Zyvora Logo" className="w-8 h-8 rounded-lg shadow-lg group-hover:scale-110 transition-transform" />
                        <div className="flex items-center gap-0.5">
                            <span className="text-2xl font-black tracking-tighter text-[#DC2626]">ZY</span>
                            <span className="text-2xl font-black tracking-tighter text-white">VORA</span>
                        </div>
                    </Link>

                    {/* Search Bar - Center (desktop only) */}
                    <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 px-4 py-1">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#DC2626] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search premium products..."
                                value={navSearch}
                                onChange={handleNavSearchChange}
                                onKeyDown={handleNavSearch}
                                onFocus={() => navSearch.trim().length >= 2 && setShowSuggestions(suggestions.length > 0)}
                                className="w-full bg-white text-black pl-10 pr-4 py-2 rounded-lg text-sm border-2 border-transparent focus:border-[#DC2626] focus:outline-none transition-all placeholder:text-gray-400"
                            />
                            {showSuggestions && (
                                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                                    {suggestions.map((product) => (
                                        <li
                                            key={product.productId}
                                            onMouseDown={() => handleSuggestionClick(product)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-0 group"
                                        >
                                            <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#DC2626] shrink-0" />
                                            <span className="text-sm text-gray-800 group-hover:text-[#DC2626] truncate">{product.productName}</span>
                                            <span className="ml-auto text-xs text-gray-400 shrink-0">{product.category?.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-4">
                        {/* Mobile Search Icon */}
                        <button
                            onClick={() => setMobileSearchOpen(true)}
                            className="md:hidden text-white hover:text-red-400 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        {/* Cart Button with Red Badge */}
                        <button
                            onClick={() => navigate('/shop/checkout')}
                            className="relative hidden md:flex items-center gap-2 text-white hover:text-red-400 transition-colors duration-200"
                        >
                            <div className="relative">
                                <ShoppingCart size={22} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none border-2 border-black">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="font-medium text-sm">Cart</span>
                        </button>

                        {/* User Profile - No sub-label */}
                        <div 
                            onClick={() => navigate("/shop/profile")} 
                            className="flex items-center gap-3 cursor-pointer pl-4 border-l border-white/20 hover:text-gray-200 transition-colors py-1 group"
                        >
                            <Avatar className="w-9 h-9 ring-2 ring-white/10 group-hover:ring-[#DC2626] transition-all border-2 border-gray-600">
                                <AvatarImage src={getAvatarUrl(user?.avatarUrl)} alt={user?.firstName} />
                                <AvatarFallback className="text-[10px] bg-[#DC2626] text-white font-bold">
                                    {user?.username?.slice(0, 2).toUpperCase() || "GU"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-white font-medium text-sm hidden sm:block">
                                {user?.firstName}
                            </span>
                        </div>
                        
                        <button onClick={() => navigate("/shop/orders")} className="text-gray-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">Orders</button>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:bg-red-500/10 hover:text-red-500 text-white transition-colors ml-1">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main className="flex-1 pb-16 md:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-around px-2 py-2 safe-area-pb">
                <button onClick={() => navigate("/shop")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === "/shop" ? "text-[#DC2626]" : "text-gray-400 hover:text-white"}`}>
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
                <button onClick={() => setMobileSearchOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Search</span>
                </button>
                <button onClick={() => navigate("/shop/checkout")} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 hover:text-white transition-colors relative">
                    <div className="relative">
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-black">
                                {itemCount > 99 ? "99+" : itemCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">Cart</span>
                </button>
                <button onClick={() => navigate("/shop/orders")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname.includes("/orders") ? "text-[#DC2626]" : "text-gray-400 hover:text-white"}`}>
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Orders</span>
                </button>
                <button onClick={() => navigate("/shop/profile")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname.includes("/profile") ? "text-[#DC2626]" : "text-gray-400 hover:text-white"}`}>
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Profile</span>
                </button>
            </nav>

            {/* Footer */}
            <footer className="bg-[#0A0A0A] text-white mt-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
                        {/* Company Logo & Social */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-black tracking-tighter text-[#DC2626]">ZY</span>
                                <span className="text-2xl font-black tracking-tighter text-white">VORA</span>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mt-3 leading-relaxed">Everything You Need, Delivered Smart.</p>
                                <p className="text-gray-600 text-xs font-bold tracking-widest mt-2 uppercase">PREMIUM SHOPPING EXPERIENCE</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Twitter className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer" />
                                <Instagram className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer" />
                                <Facebook className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer" />
                            </div>
                        </div>

                        {/* Shop Column */}
                        <div>
                            <h3 className="text-red-600 font-bold text-xs tracking-widest uppercase mb-4">Shop</h3>
                            <ul className="text-sm">
                                <li onClick={() => navigate("/shop")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">All Products</li>
                                <li onClick={() => navigate("/shop")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Electronics</li>
                                <li onClick={() => navigate("/shop")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Clothing</li>
                                <li onClick={() => navigate("/shop")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Home & Garden</li>
                                <li onClick={() => navigate("/shop")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Food & Beverage</li>
                            </ul>
                        </div>

                        {/* Support Column */}
                        <div>
                            <h3 className="text-red-600 font-bold text-xs tracking-widest uppercase mb-4">Support</h3>
                            <ul className="text-sm">
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Help Center</li>
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Shipping Info</li>
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Returns</li>
                                <li onClick={() => navigate("/shop/orders")} className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Track Order</li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h3 className="text-red-600 font-bold text-xs tracking-widest uppercase mb-4">Company</h3>
                            <ul className="text-sm">
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">About Us</li>
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Contact</li>
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Careers</li>
                                <li className="text-gray-400 hover:text-white transition-colors cursor-pointer block mb-2">Privacy Policy</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-white/5 mt-16 pt-8">
                        <p className="text-gray-600 text-xs text-center">
                            © 2026 Zyvora · All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

