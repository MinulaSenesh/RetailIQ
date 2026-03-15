import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    ShoppingBag, 
    Search, 
    Filter, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Truck, 
    PackageCheck,
    RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OrderItem {
    orderItemId: number;
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

interface Customer {
    customerId: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface Order {
    orderId: number;
    orderDate: string;
    status: string;
    totalAmount: number;
    customer?: Customer;
    items: OrderItem[];
}

const STATUS_OPTIONS = [
    { label: 'Pending', value: 'PENDING', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { label: 'Confirmed', value: 'CONFIRMED', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { label: 'Shipped', value: 'SHIPPED', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { label: 'Delivered', value: 'DELIVERED', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { label: 'Cancelled', value: 'CANCELLED', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const isAnalyst = user?.role === "ANALYST";
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async (targetPage = page) => {
        try {
            setLoading(true);
            const res = await api.get(`/orders?page=${targetPage}&size=20`);
            console.log("API Response:", res.data);
            const data = res.data?.data || [];
            
            // Handle both Page object and direct List
            const ordersList = Array.isArray(data) ? data : (data.content || []);
            setOrders(ordersList);
            
            // Extract pagination info if available
            if (res.data?.message?.includes("page")) {
                const totalMatch = res.data.message.match(/of (\d+)/);
                if (totalMatch) setTotalPages(parseInt(totalMatch[1]));
            }
            
            if (ordersList.length === 0) {
                console.warn("No orders returned from API");
            }
        } catch (error: any) {
            console.error("Failed to fetch orders:", error);
            showNotification(`Failed to load orders: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const updateStatus = async (orderId: number, newStatus: string) => {
        if (isAnalyst) return;
        try {
            await api.put(`/orders/${orderId}/status?status=${newStatus}`);
            showNotification(`Order #${orderId} updated to ${newStatus}`, 'success');
            fetchOrders(page);
        } catch (error: any) {
            console.error("Failed to update status:", error);
            showNotification("Failed to update order status.", 'error');
        }
    };

    const filteredOrders = orders.filter(o => {
        if (!search.trim()) return true;
        const query = search.toLowerCase().trim();

        // Strip '#' from search if user types "#123"
        const cleanQuery = query.startsWith('#') ? query.slice(1) : query;
        const idMatches = o.orderId.toString().includes(cleanQuery);
        
        const customerFirstName = o.customer?.firstName || '';
        const customerLastName = o.customer?.lastName || '';
        const customerEmail = o.customer?.email || '';
        
        const customerName = `${customerFirstName} ${customerLastName}`.toLowerCase();
        const nameMatches = customerName.includes(query);
        const emailMatches = customerEmail.toLowerCase().includes(query);

        return idMatches || nameMatches || emailMatches;
    });

    const getStatusStyles = (status: string) => {
        return STATUS_OPTIONS.find(opt => opt.value === status.toUpperCase())?.color || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-foreground">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Order Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Monitor and process customer purchases</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => fetchOrders(page)} variant="outline" className="gap-2 font-bold border-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
                    notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-bold">{notification.message}</span>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        className="w-full bg-card border-2 border-input rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-4 ring-primary/10 focus:border-primary transition-all font-medium"
                        placeholder="Search by Order ID (#), Customer Name or Email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 font-bold px-6 h-auto border-2 border-input bg-card">
                    <Filter className="w-4 h-4" />
                    Status: All
                </Button>
            </div>

            {/* Orders Table */}
            <Card className="border-2 shadow-xl shadow-black/5 overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b-2">
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Order ID</th>
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Customer</th>
                                    <th className="text-left py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Date</th>
                                    <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Amount</th>
                                    <th className="text-center py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                                    {!isAnalyst && <th className="text-right py-4 px-6 text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading && orders.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="py-4 px-6 text-center text-muted-foreground">Loading orders...</td>
                                        </tr>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center space-y-3">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
                                                <Search className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-lg font-bold">No orders found</p>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                                Try adjusting your search or refresh to check for new orders.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map(order => (
                                        <tr key={order.orderId} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-black text-primary">#{order.orderId}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">
                                                        {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "System Guest"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{order.customer?.email || "No email available"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="font-black font-mono">{formatCurrency(order.totalAmount)}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Badge className={`border-2 ${getStatusStyles(order.status)}`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            {!isAnalyst && (
                                                <td className="py-4 px-6 text-right">
                                                    <select 
                                                        className="bg-background border-2 rounded-lg px-2 py-1.5 text-[11px] font-black focus:ring-4 ring-primary/10 outline-none transition-all cursor-pointer border-input hover:border-primary"
                                                        value={order.status.toUpperCase()}
                                                        onChange={(e) => updateStatus(order.orderId, e.target.value)}
                                                    >
                                                        {STATUS_OPTIONS.map(opt => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination / Summary Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
                <p>Showing {filteredOrders.length} orders on page {page + 1}</p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="font-black"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-primary text-primary-foreground font-black text-xs">
                        {page + 1}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page + 1 >= totalPages || loading}
                        className="font-black"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
