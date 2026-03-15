// src/pages/ProductsPage.tsx
import { useEffect, useState } from "react";
import { Search, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { productService } from "@/api/products";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Trash2, Edit, ArrowUpDown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
    const { user } = useAuth();
    const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const loadProducts = () => {
        setLoading(true);
        api.get("/products")
            .then(r => setProducts(r.data.data ?? []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await productService.delete(id);
                loadProducts();
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete product. Only Admins/Managers can delete.");
            }
        }
    };

    const handleToggleActive = async (product: Product, newActiveStatus: boolean) => {
        try {
            // Optimistic UI update
            setProducts(prev => prev.map(p => p.productId === product.productId ? { ...p, active: newActiveStatus } : p));
            await productService.update(product.productId, {
                ...product,
                active: newActiveStatus,
                category: { categoryId: product.category.categoryId }
            } as any);
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on failure
            setProducts(prev => prev.map(p => p.productId === product.productId ? { ...p, active: !newActiveStatus } : p));
            alert("Failed to update product status.");
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filtered = [...products]
        .filter(p =>
            (p.productName ?? "").toLowerCase().includes(search.toLowerCase()) ||
            (p.sku ?? "").toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortConfig) return 0;
            const { key, direction } = sortConfig;
            let valA: any = a[key as keyof Product];
            let valB: any = b[key as keyof Product];

            if (key === 'category') {
                valA = a.category?.name ?? "";
                valB = b.category?.name ?? "";
            }

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground text-sm mt-1">Catalog management and stock overview</p>
                </div>
                {canEdit && (
                    <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
                        Add Product
                    </Button>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {[
                    { label: "Total Products", value: products.length },
                    { label: "Active", value: products.filter(p => p.active).length },
                    { label: "Low Stock (<10)", value: products.filter(p => (p.stockQuantity ?? 0) < 10).length },
                    { label: "Out of Stock", value: products.filter(p => p.stockQuantity === 0).length },
                ].map(({ label, value }) => (
                    <Card key={label}>
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground">{label}</p>
                            <p className="text-2xl font-bold mt-1">{loading ? "—" : value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5" />Product Catalog</CardTitle>
                    <div className="relative ml-auto w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search name or SKU…" className="pl-9" value={search} onChange={(e: any) => setSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="px-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6 cursor-pointer hover:text-foreground" onClick={() => handleSort('productName')}>
                                    Name <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('sku')}>
                                    SKU <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('category')}>
                                    Category <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('unitPrice')}>
                                    Price <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('costPrice')}>
                                    Cost <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('stockQuantity')}>
                                    Stock <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => handleSort('active')}>
                                    Status <ArrowUpDown className="ml-1 h-3 w-3 inline" />
                                </TableHead>
                                {canEdit && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={7} className="pl-6"><Skeleton className="h-5 w-full" /></TableCell></TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No products found</TableCell></TableRow>
                            ) : (
                                filtered.map(p => (
                                    <TableRow key={p.productId} className="hover:bg-muted/40">
                                        <TableCell className="font-medium pl-6">{p.productName}</TableCell>
                                        <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                                        <TableCell><Badge variant="outline">{p.category?.name ?? "—"}</Badge></TableCell>
                                        <TableCell className="text-right font-mono text-sm">{formatCurrency(p.unitPrice)}</TableCell>
                                        <TableCell className="text-right font-mono text-sm text-muted-foreground">{formatCurrency(p.costPrice)}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={p.stockQuantity === 0 ? "text-red-500 font-semibold" : (p.stockQuantity ?? 0) < 10 ? "text-amber-500 font-semibold" : ""}>
                                                {p.stockQuantity}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={p.active}
                                                    onCheckedChange={(val) => handleToggleActive(p, val)}
                                                    disabled={!canEdit}
                                                />
                                                <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Active" : "Inactive"}</Badge>
                                            </div>
                                        </TableCell>
                                        {canEdit && (
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(p.productId)}><Trash2 className="w-4 h-4" /></Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <ProductFormDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSuccess={loadProducts}
                product={editingProduct}
            />
        </div>
    );
}
