import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Shield, Truck, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { getProductImage } from "@/utils/productImages";

export default function CheckoutPage() {
    const { items, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CARD");

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const orderPayload = {
                customerId: user?.userId,
                items: items.map(i => ({
                    productId: i.product.productId,
                    quantity: i.quantity,
                    price: i.product.unitPrice
                })),
                totalAmount,
                paymentMethod
            };

            const response = await api.post("/orders/checkout", orderPayload);
            const order = response.data.data;

            // Visualization Mode: Skip real payment gateway and show success
            console.log(`SIMULATION: Order #${order.orderId} created with method: ${paymentMethod}`);
            
            // Wait a moment to simulate "Processing"
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            clearCart();
            setOrderComplete(true);
        } catch (error: any) {
            console.error("Checkout failed", error);
            alert(error.response?.data?.message || "Checkout failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const launchPayHere = (params: any) => {
        // PayHere Sandbox Checkout
        const form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', 'https://sandbox.payhere.lk/pay/checkout');

        // Sandbox uses these params
        const fields: any = {
            ...params,
            return_url: window.location.origin + "/payment-success",
            cancel_url: window.location.origin + "/checkout",
            notify_url: "https://retailiq-api.onrender.com/api/v1/payments/payhere/notify" // Place-holder for PayHere to accept
        };

        for (const key in fields) {
            const input = document.createElement('input');
            input.setAttribute('type', 'hidden');
            input.setAttribute('name', key);
            input.setAttribute('value', fields[key]);
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    if (orderComplete) {
        const methodNames: any = {
            "CARD": "Credit / Debit Card",
            "EZCASH": "eZ Cash / mCash",
            "COD": "Cash on Delivery"
        };
        
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-28 h-28 bg-[#16A34A]/10 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-14 h-14 text-[#16A34A]" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-[#0A0A0A]">Order Confirmed!</h1>
                    <div className="p-4 bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-2xl inline-block mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Payment Method</p>
                        <p className="text-[#0A0A0A] font-black uppercase tracking-tighter">{methodNames[paymentMethod] || paymentMethod}</p>
                    </div>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Thank you for choosing <span className="text-[#DC2626] font-bold">Zyvora</span>. We've received your order and are preparing it for smart delivery.
                    </p>
                </div>
                <Button 
                    size="lg" 
                    onClick={() => navigate("/shop")} 
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-6 rounded-full font-bold shadow-lg shadow-[#DC2626]/20 transition-all hover:scale-105 active:scale-95"
                >
                    Continue Shopping
                </Button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-[#DC2626]/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-[#DC2626]" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">Your Zyvora cart is empty</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">Looks like you haven't added any premium products to your cart yet.</p>
                </div>
                <Button 
                    onClick={() => navigate("/shop")} 
                    className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-8 py-6 rounded-full font-bold"
                >
                    Start Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Left 70%: Cart item list */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-6">
                        <h1 className="text-3xl font-black tracking-tighter text-[#0A0A0A]">Shopping Cart ({items.length})</h1>
                        <button 
                            onClick={() => navigate("/shop")} 
                            className="text-[#DC2626] font-bold text-sm hover:underline flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-4 h-4" /> Continue Shopping
                        </button>
                    </div>

                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.product.productId} className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-[#E5E7EB] last:border-0">
                                {/* Product Image */}
                                <div className="w-24 h-24 bg-[#F9FAFB] rounded-xl flex-shrink-0 overflow-hidden border border-[#E5E7EB]">
                                    <img
                                        src={getProductImage(item.product.category?.name || 'Default', item.product.productId, item.product)}
                                        alt={item.product.productName}
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                
                                <div className="flex-1 flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight">{item.product.productName}</h3>
                                        <p className="text-[10px] text-[#6B7280] font-bold tracking-widest uppercase">{item.product.sku}</p>
                                        <p className="font-black text-[#0A0A0A] mt-2">LKR {item.product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    
                                    <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-4">
                                        <div className="flex items-center border-2 border-[#0A0A0A] rounded-lg overflow-hidden bg-white">
                                            <button
                                                className="px-3 py-1.5 bg-transparent hover:bg-[#0A0A0A] hover:text-white transition-colors text-sm font-bold text-[#0A0A0A] disabled:opacity-30"
                                                onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <span className="w-10 text-center text-sm font-black border-x-2 border-[#0A0A0A] text-[#0A0A0A]">{item.quantity}</span>
                                            <button
                                                className="px-3 py-1.5 bg-transparent hover:bg-[#0A0A0A] hover:text-white transition-colors text-sm font-bold text-[#0A0A0A]"
                                                onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                                            >+</button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => removeFromCart(item.product.productId)}
                                            className="text-[#DC2626] text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right 30%: Order Summary card */}
                <div className="w-full md:w-[380px]">
                    <div className="sticky top-24 space-y-4">
                        <div className="bg-white border-2 border-[#0A0A0A] rounded-2xl p-6 shadow-xl shadow-black/5">
                            <h2 className="text-xl font-black tracking-tighter text-[#0A0A0A] mb-6 uppercase">Order Summary</h2>
                            
                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span className="text-[#0A0A0A]">LKR {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Estimated Shipping</span>
                                    {totalAmount > 5000 ? (
                                        <span className="text-[#16A34A] font-bold uppercase text-xs tracking-widest">FREE</span>
                                    ) : (
                                        <span className="text-[#0A0A0A]">LKR 500.00</span>
                                    )}
                                </div>
                                
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Tax estimate</span>
                                    <span className="text-[#0A0A0A]">LKR 0.00</span>
                                </div>

                                <div className="border-t border-[#E5E7EB] pt-6 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Payment Method</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button 
                                            onClick={() => setPaymentMethod("CARD")}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'CARD' ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-[#E5E7EB] bg-white hover:border-gray-300'}`}
                                        >
                                            <div className={`p-2 rounded-full ${paymentMethod === 'CARD' ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-black uppercase tracking-tighter ${paymentMethod === 'CARD' ? 'text-[#DC2626]' : 'text-[#0A0A0A]'}`}>Credit / Debit Card</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Visa, Mastercard, AMEX</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setPaymentMethod("EZCASH")}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'EZCASH' ? 'border-[#DC2626] bg-[#DC2626]/5' : 'border-[#E5E7EB] bg-white hover:border-gray-300'}`}
                                        >
                                            <div className={`p-2 rounded-full ${paymentMethod === 'EZCASH' ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-black uppercase tracking-tighter ${paymentMethod === 'EZCASH' ? 'text-[#DC2626]' : 'text-[#0A0A0A]'}`}>eZ Cash / mCash</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Mobile Wallet Checkout</p>
                                            </div>
                                        </button>

                                        <button 
                                            onClick={() => setPaymentMethod("COD")}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${paymentMethod === 'COD' ? 'border-[#0A0A0A] bg-[#0A0A0A]/5' : 'border-[#E5E7EB] bg-white hover:border-gray-300'}`}
                                        >
                                            <div className={`p-2 rounded-full ${paymentMethod === 'COD' ? 'bg-[#0A0A0A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Banknote className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={`text-xs font-black uppercase tracking-tighter ${paymentMethod === 'COD' ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]'}`}>Cash on Delivery</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Pay when you receive</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-[#E5E7EB] pt-6 flex flex-col gap-1">
                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-black tracking-tighter text-[#0A0A0A] uppercase">Total Amount</span>
                                        <span className="text-3xl font-black tracking-tighter text-[#DC2626]">
                                            LKR {(totalAmount > 5000 ? totalAmount : totalAmount + 500).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium">All taxes and duties included</p>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-lg font-black py-8 mt-8 rounded-xl shadow-lg shadow-[#DC2626]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>SECURE CHECKOUT <ArrowRight className="w-5 h-5" /></>
                                )}
                            </Button>
                            
                            <p className="mt-6 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-[#16A34A]" /> Guaranteed Safe & Secure Checkout
                            </p>
                        </div>
                        
                        <div className="bg-[#F9FAFB] border-2 border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <Truck className="w-5 h-5 text-[#DC2626]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-[#0A0A0A]">Smart Fast Delivery</p>
                                <p className="text-[10px] text-gray-400">Receive your smart package within 2-3 business days.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

