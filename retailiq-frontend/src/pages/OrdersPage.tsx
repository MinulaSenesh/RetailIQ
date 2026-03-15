import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Package, ChevronRight, Clock } from "lucide-react";
import api from "@/lib/api";

interface OrderItem {
    orderItemId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface Order {
    orderId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    items: OrderItem[];
}

export default function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/orders/my-orders")
            .then(res => {
                const data = res.data?.data || res.data || [];
                setOrders(Array.isArray(data) ? data : []);
            })
            .catch(() => setError("Failed to load orders."))
            .finally(() => setLoading(false));
    }, []);

    const statusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed": return "bg-green-100 text-green-700";
            case "pending":   return "bg-yellow-100 text-yellow-700";
            case "cancelled": return "bg-red-100 text-red-700";
            case "processing": return "bg-blue-100 text-blue-700";
            default:          return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate("/shop")}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium text-sm mb-10"
                >
                    <ArrowLeft size={16} /> Back to Shop
                </button>

                <div className="flex items-center gap-3 mb-10">
                    <ShoppingBag className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-1/4" />
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-medium">
                        {error}
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-400 mb-8">When you place an order, it will appear here.</p>
                        <button
                            onClick={() => navigate("/shop")}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                        >
                            Start Shopping
                        </button>
                    </div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.orderId} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">Order #{order.orderId}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Clock size={11} />
                                            {new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${statusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className="font-black text-gray-900">LKR {Number(order.totalAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                                {order.items && order.items.length > 0 && (
                                    <div className="border-t border-gray-100 pt-3 space-y-1">
                                        {order.items.slice(0, 3).map((item, idx) => (
                                            <p key={idx} className="text-xs text-gray-500">
                                                {item.quantity}x {item.productName} — LKR {Number(item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                            </p>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
