import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Product, Category } from "@/types";
import { productService } from "@/api/products";
import { categoryService } from "@/api/categories";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { ShoppingCart, Search, Star, Zap, Truck, Shield, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShaderDemo } from "@/components/ui/shader-demo";
import { getProductImage, getFallbackLabel } from "@/utils/productImages";

export default function StorefrontPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const q = searchParams.get("search") || "";
        setSearchQuery(q);
    }, [searchParams]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [addedId, setAddedId] = useState<number | null>(null);
    const { addToCart } = useCart();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [prodsRes, catsRes] = await Promise.all([
                    productService.getAll(0, 500),
                    categoryService.getAll()
                ]);
                const productsData = prodsRes?.data?.content || (prodsRes as any)?.content || (prodsRes as any)?.data || [];
                setProducts(productsData.filter((p: Product) => p.active && p.stockQuantity > 0));
                setCategories(catsRes);
            } catch (error) {
                console.error("Failed to load storefront data", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const filteredProducts = products.filter((product) => {
        const query = searchQuery.toLowerCase().trim();

        const matchesSearch = !query || (
            product.productName?.toLowerCase().includes(query) ||
            product.category?.name?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
        );

        const matchesCategory =
            !selectedCategory ||
            product.category?.categoryId === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
        setAddedId(product.productId);
        setTimeout(() => setAddedId(null), 1200);
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Zyvora Hero Section */}
            <div className="bg-[#0A0A0A] relative overflow-hidden py-24 sm:py-32">
                {/* Subtle Red Glow / Accents */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DC2626]/10 blur-[120px] rounded-full -z-0" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#DC2626]/5 blur-[80px] rounded-full -z-0" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Shop Smarter with <span className="text-[#DC2626]">Zyvora</span>
                    </h1>
                    <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        Premium products at unbeatable prices, delivered to your door. Everything You Need, Delivered Smart.
                    </p>
                    <Button
                        size="lg"
                        className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-10 py-7 rounded-full text-lg font-bold shadow-xl shadow-[#DC2626]/20 transition-all hover:scale-105 active:scale-95 duration-300"
                        onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Now
                    </Button>
                </div>
            </div>

            {/* Trust Badges / Feature Bar */}
            <div className="bg-white border-b border-gray-200 py-3">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
                        <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-red-600" />
                            <span className="text-gray-700 font-medium text-sm">Free Shipping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-600" />
                            <span className="text-gray-700 font-medium text-sm">Secure Checkout</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-red-600" />
                            <span className="text-gray-700 font-medium text-sm">Top Rated Products</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-3 mb-10 justify-center">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedCategory === null
                            ? "bg-[#0A0A0A] text-white shadow-lg shadow-black/10"
                            : "bg-white border-2 border-[#E5E7EB] text-[#0A0A0A] hover:border-[#DC2626] hover:text-[#DC2626]"
                            }`}
                    >
                        All Categories
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.categoryId}
                            onClick={() => setSelectedCategory(cat.categoryId)}
                            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat.categoryId
                                ? "bg-[#0A0A0A] text-white shadow-lg shadow-black/10"
                                : "bg-white border-2 border-[#E5E7EB] text-[#0A0A0A] hover:border-[#DC2626] hover:text-[#DC2626]"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <p className="text-sm text-slate-500 mb-6">
                    Showing <span className="font-semibold text-slate-700">{filteredProducts.length}</span> products
                </p>

                {/* Product Grid */}
                <div id="product-grid" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden border-[#E5E7EB] shadow-none">
                                <Skeleton className="aspect-square w-full rounded-none" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-6 w-1/3" />
                                </div>
                            </Card>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full text-center py-32">
                            <div className="w-24 h-24 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-[#0A0A0A]">No products found for "{searchQuery}"</h3>
                            <p className="text-gray-400 mt-2">Try a different search term or browse all categories</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <Card
                                key={product.productId}
                                onClick={() => navigate(`/shop/product/${product.productId}`)}
                                className="group bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 hover:border-gray-300 relative"
                            >
                                {/* Product Image Area */}
                                <div className="relative w-full h-32 sm:h-48 bg-gray-50 overflow-hidden rounded-t-lg">
                                    <img
                                        src={getProductImage(product.category?.name || 'Default', product.productId)}
                                        alt={product.productName}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e: any) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div
                                        className="w-full h-full items-center justify-center bg-gray-100 flex-col gap-2"
                                        style={{ display: 'none' }}
                                    >
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package size={24} className="text-gray-400" />
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                                            {getFallbackLabel(product.category?.name || 'Default')}
                                        </span>
                                    </div>
                                </div>

                                {/* Product details */}
                                <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-4 border-t border-[#E5E7EB]">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-[#0A0A0A] text-sm sm:text-lg leading-tight line-clamp-2" title={product.productName}>
                                            {product.productName}
                                        </h3>
                                        <p className="hidden sm:block text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">{product.sku}</p>
                                    </div>

                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-[#6B7280] font-medium">(124 reviews)</span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <p className="text-base sm:text-2xl font-black text-[#0A0A0A] tracking-tighter">
                                                LKR {product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                            <div className="mt-1">
                                                {product.stockQuantity < 1 ? (
                                                    <span className="text-[10px] font-bold text-[#DC2626] uppercase">Out of Stock</span>
                                                ) : product.stockQuantity < 10 ? (
                                                    <span className="text-[10px] font-bold text-[#DC2626] uppercase">Only {product.stockQuantity} left</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-[#16A34A] uppercase flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" /> In Stock
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 overflow-hidden">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={product.stockQuantity < 1}
                                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:transform sm:translate-y-full sm:group-hover:translate-y-0 sm:transition-transform sm:duration-200 sm:ease-out flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                            >
                                                <ShoppingCart size={16} />
                                                {product.stockQuantity >= 1 ? 'Add to Cart' : 'Out of Stock'}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}


