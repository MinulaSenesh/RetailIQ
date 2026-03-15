// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, BarChart3, Package, Users, Upload, LogOut, Moon, Sun, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { to: "/analytics", label: "Analytics", Icon: BarChart3 },
    { to: "/products", label: "Products", Icon: Package },
    { to: "/customers", label: "Customers", Icon: Users },
    { to: "/upload", label: "Data Upload", Icon: Upload },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dark, setDark] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("admin_theme");
            if (saved) return saved === "dark";
            return document.documentElement.classList.contains("dark");
        }
        return false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem("admin_theme", dark ? "dark" : "light");
    }, [dark]);

    const handleLogout = () => { logout(); navigate("/login"); };
    const initials = user ? `${user.username.slice(0, 2).toUpperCase()}` : "RI";

    return (
        <aside className="flex flex-col w-64 h-full border-r bg-card shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-2 px-6 py-5 border-b">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                    <BarChart3 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">RetailIQ</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {(user?.role === "ADMIN"
                    ? [...BASE_NAV_ITEMS, { to: "/audit", label: "Audit Log", Icon: FileClock }]
                    : BASE_NAV_ITEMS
                ).map(({ to, label, Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3.5 px-4 py-3 rounded-md text-[15px] transition-all",
                                isActive
                                    ? "bg-accent/80 text-foreground font-medium"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium"
                            )
                        }
                    >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t space-y-3">
                <div className="flex items-center gap-2">
                    <Label htmlFor="dark-toggle" className="text-xs text-muted-foreground flex items-center gap-1">
                        {dark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                        {dark ? "Dark mode" : "Light mode"}
                    </Label>
                    <Switch id="dark-toggle" checked={dark} onCheckedChange={setDark} className="ml-auto" />
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all group">
                        <Avatar className="w-8 h-8 group-hover:ring-2 ring-primary/20 transition-all">
                            <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{(user?.firstName || user?.username) ?? "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">View Profile</p>
                        </div>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="shrink-0 px-2">
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
