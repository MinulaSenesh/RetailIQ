// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import CompleteProfilePage from "@/pages/CompleteProfilePage";
import StorefrontPage from "@/pages/StorefrontPage";
import CheckoutPage from "@/pages/CheckoutPage";
import DashboardPage from "@/pages/DashboardPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProductsPage from "@/pages/ProductsPage";
import CustomersPage from "@/pages/CustomersPage";
import UploadPage from "@/pages/UploadPage";
import AuditLogPage from "@/pages/AuditLogPage";
import ProfilePage from "@/pages/ProfilePage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import OrdersPage from "@/pages/OrdersPage";
import NotFoundPage from "@/pages/NotFoundPage";

/** Redirects unauthenticated users to /login */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Only allows ADMIN / MANAGER / ANALYST — kicks CUSTOMER to /shop */
function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === "CUSTOMER") return <Navigate to="/shop" replace />;
    return <>{children}</>;
}

/** Only allows CUSTOMER — kicks admins to /dashboard */
function CustomerRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== "CUSTOMER") return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
}

/** Manages branding (Title & Favicon) dynamically */
function BrandingManager() {
    const location = useLocation();
    const { user } = useAuth();
    
    useEffect(() => {
        const isShop = location.pathname.startsWith("/shop");
        const isLogin = location.pathname === "/login" || location.pathname === "/register";
        
        // Update Title
        if (isShop) {
            document.title = "Zyvora — Premium Shopping";
        } else if (isLogin) {
            document.title = "Zyvora — Login";
        } else {
            document.title = "RetailIQ — Analytics Dashboard";
        }
        
        // Update Favicon
        const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (favicon) {
            if (isShop || isLogin) {
                favicon.href = "/zyvora-logo.png";
                favicon.type = "image/png";
            } else {
                // Use professional RetailIQ logo icon
                favicon.href = "/retailiq-logo.png";
                favicon.type = "image/png";
            }
        }
    }, [location.pathname]);
    
    return null;
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <BrandingManager />
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/complete-profile"
                            element={
                                <CustomerRoute>
                                    <CompleteProfilePage />
                                </CustomerRoute>
                            }
                        />

                        {/* Customer storefront — CUSTOMER role only */}
                        <Route
                            path="/shop"
                            element={
                                <CustomerRoute>
                                    <StorefrontLayout />
                                </CustomerRoute>
                            }
                        >
                            <Route index element={<StorefrontPage />} />
                            <Route path="product/:productId" element={<ProductDetailPage />} />
                            <Route path="checkout" element={<CheckoutPage />} />
                            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
                        </Route>

                        {/* Admin dashboard — ADMIN / MANAGER / ANALYST only */}
                        <Route
                            path="/"
                            element={
                                <AdminRoute>
                                    <AppLayout />
                                </AdminRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="analytics" element={<AnalyticsPage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="customers" element={<CustomersPage />} />
                            <Route path="upload" element={<UploadPage />} />
                            <Route path="audit" element={<AuditLogPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="orders" element={<AdminOrdersPage />} />
                        </Route>

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}
