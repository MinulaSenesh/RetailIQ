import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { productService } from "@/api/products";
import { useCart } from "@/context/CartContext";
import { getProductImage, getFallbackLabel } from "@/utils/productImages";
import {
  ShoppingCart, ArrowLeft, Star, Package,
  Truck, ShieldCheck, RefreshCw, Minus, Plus,
  ChevronRight
} from "lucide-react";

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setQuantity(1);
      setAddedToCart(false);
      setImgError(false);
      try {
        // Load product by ID
        const res = await productService.getById(Number(productId));
        const prod = res?.data || (res as any);
        setProduct(prod);

        // Load related products from same category
        const allRes = await productService.getAll(0, 500);
        const all = allRes?.data?.content
          || (allRes as any)?.content
          || (allRes as any)?.data
          || [];
        const related = all.filter(
          (p: Product) =>
            p.category?.name === prod?.category?.name &&
            p.productId !== prod?.productId &&
            p.active &&
            p.stockQuantity > 0
        ).slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) load();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev =>
      Math.max(1, Math.min(prev + delta, product?.stockQuantity || 1))
    );
  };

  // ── LOADING STATE ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-10 w-40 bg-gray-200 rounded" />
                <div className="h-12 w-full bg-gray-200 rounded" />
                <div className="h-12 w-full bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── NOT FOUND STATE ────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center
                      justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">
            Product not found
          </h2>
          <p className="text-gray-500 mt-2">
            This product may no longer be available.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white
                       font-semibold px-6 py-3 rounded-lg
                       transition-colors duration-200"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;
  const lowStock = product.stockQuantity > 0 && product.stockQuantity < 10;

  // ── MAIN RENDER ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <span
            onClick={() => navigate('/shop')}
            className="hover:text-red-600 cursor-pointer
                       transition-colors font-medium"
          >
            Shop
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span
            onClick={() => navigate('/shop')}
            className="hover:text-red-600 cursor-pointer transition-colors"
          >
            {product.category?.name}
          </span>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.productName}
          </span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

          {/* LEFT — Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200
                            overflow-hidden aspect-square flex items-center
                            justify-center shadow-sm">
              {!imgError ? (
                <img
                  src={getProductImage(
                    product.category?.name || 'Default',
                    product.productId
                  )}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center
                                gap-3 text-gray-300">
                  <Package size={64} />
                  <span className="text-sm font-medium uppercase
                                   tracking-wide">
                    {getFallbackLabel(product.category?.name || 'Default')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Product Details */}
          <div className="flex flex-col justify-center space-y-6">

            {/* Category badge */}
            <div>
              <span className="bg-black text-white text-xs font-bold
                               px-3 py-1 rounded-full uppercase
                               tracking-widest">
                {product.category?.name}
              </span>
            </div>

            {/* Product name */}
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              {product.productName}
            </h1>

            {/* SKU */}
            <p className="text-xs text-gray-400 font-bold uppercase
                          tracking-widest">
              SKU: {product.sku}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                (124 reviews)
              </span>
            </div>

            {/* Price */}
            <div className="py-4 border-t border-b border-gray-100">
              <p className="text-4xl font-black text-gray-900
                            tracking-tighter">
                LKR {product.unitPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2
                })}
              </p>
              <div className="mt-2">
                {!inStock ? (
                  <span className="text-xs font-bold text-red-600
                                   uppercase tracking-wide">
                    Out of Stock
                  </span>
                ) : lowStock ? (
                  <span className="text-xs font-bold text-red-600
                                   uppercase tracking-wide">
                    Only {product.stockQuantity} left in stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-green-600
                                   uppercase tracking-wide
                                   flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full
                                     bg-green-500 animate-pulse" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Quantity selector */}
            {inStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700
                                 uppercase tracking-wide">
                  Quantity
                </span>
                <div className="flex items-center border border-gray-300
                                rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center
                               bg-gray-50 hover:bg-gray-100
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors border-r border-gray-300"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900
                                   text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity}
                    className="w-10 h-10 flex items-center justify-center
                               bg-gray-50 hover:bg-gray-100
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors border-l border-gray-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stockQuantity} available
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full bg-red-600 hover:bg-red-700
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           text-white font-bold py-4 rounded-xl
                           transition-all duration-200 active:scale-95
                           flex items-center justify-center gap-3
                           shadow-lg shadow-red-600/20 text-sm
                           uppercase tracking-widest"
              >
                <ShoppingCart size={18} />
                {addedToCart
                  ? 'Added to Cart!'
                  : !inStock
                  ? 'Out of Stock'
                  : 'Add to Cart'
                }
              </button>

              <button
                onClick={() => {
                  handleAddToCart();
                  navigate('/shop/checkout');
                }}
                disabled={!inStock}
                className="w-full bg-black hover:bg-gray-900
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           text-white font-bold py-4 rounded-xl
                           transition-all duration-200 active:scale-95
                           text-sm uppercase tracking-widest"
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="flex flex-col items-center gap-1 p-3
                              bg-white rounded-xl border border-gray-100">
                <Truck size={18} className="text-red-600" />
                <span className="text-xs text-gray-500 text-center
                                 font-medium leading-tight">
                  Free Shipping
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3
                              bg-white rounded-xl border border-gray-100">
                <ShieldCheck size={18} className="text-red-600" />
                <span className="text-xs text-gray-500 text-center
                                 font-medium leading-tight">
                  Secure Payment
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3
                              bg-white rounded-xl border border-gray-100">
                <RefreshCw size={18} className="text-red-600" />
                <span className="text-xs text-gray-500 text-center
                                 font-medium leading-tight">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              More from{' '}
              <span className="text-red-600">
                {product.category?.name}
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(related => (
                <div
                  key={related.productId}
                  onClick={() => navigate(
                    `/shop/product/${related.productId}`
                  )}
                  className="bg-white border border-gray-200 rounded-xl
                             overflow-hidden cursor-pointer group
                             transition-all duration-200
                             hover:shadow-lg hover:-translate-y-1
                             hover:border-gray-300"
                >
                  <div className="h-36 bg-gray-50 overflow-hidden">
                    <img
                      src={getProductImage(
                        related.category?.name || 'Default',
                        related.productId
                      )}
                      alt={related.productName}
                      className="w-full h-full object-cover
                                 group-hover:scale-105
                                 transition-transform duration-300"
                      onError={(e: any) => {
                        (e.target as any).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm
                                  line-clamp-2 leading-tight">
                      {related.productName}
                    </p>
                    <p className="text-red-600 font-black text-sm mt-1">
                      LKR {related.unitPrice.toLocaleString('en-US', {
                        minimumFractionDigits: 2
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-12 pb-8">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-gray-500
                       hover:text-red-600 transition-colors
                       font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back to Shop
          </button>
        </div>

      </div>
    </div>
  );
}

