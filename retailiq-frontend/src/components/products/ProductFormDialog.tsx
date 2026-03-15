import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Product, Category } from "@/types";
import { productService } from "@/api/products";
import { categoryService } from "@/api/categories";
import { CategoryCombobox } from "@/components/products/CategoryCombobox";

const productSchema = z.object({
    productName: z.string().min(2, "Name must be at least 2 characters"),
    categoryId: z.coerce.number().min(1, "Please select a category"),
    sku: z.string().min(2, "SKU must be at least 2 characters"),
    unitPrice: z.coerce.number({ invalid_type_error: "Retail price is required" }).min(0.01, "Price must be greater than 0"),
    costPrice: z.coerce.number({ invalid_type_error: "Cost price is required" }).min(0.01, "Cost must be greater than 0"),
    stockQuantity: z.coerce.number({ invalid_type_error: "Stock is required" }).int("Stock must be a whole number").min(0, "Stock cannot be negative"),
    active: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product?: Product | null;
}

export function ProductFormDialog({ isOpen, onClose, onSuccess, product }: ProductFormDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            productName: "",
            categoryId: 0,
            sku: "",
            unitPrice: undefined,
            costPrice: undefined,
            stockQuantity: undefined,
            active: true,
        },
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const selectedCategoryId = watch("categoryId");

    useEffect(() => {
        categoryService.getAll().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        if (product) {
            reset({
                productName: product.productName,
                categoryId: product.category?.categoryId || 0,
                sku: product.sku,
                unitPrice: product.unitPrice,
                costPrice: product.costPrice,
                stockQuantity: product.stockQuantity,
                active: product.active,
            });
        } else {
            reset({
                productName: "",
                categoryId: 0,
                sku: "",
                unitPrice: undefined,
                costPrice: undefined,
                stockQuantity: undefined,
                active: true,
            });
        }
    }, [product, reset, isOpen]);

    if (!isOpen) return null;

    const onSubmit = async (data: ProductFormValues) => {
        try {
            const payload = {
                ...data,
                category: { categoryId: data.categoryId } // mapping for backend
            };

            if (product) {
                await productService.update(product.productId, payload as any);
            } else {
                await productService.create(payload as any);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save product", error);
            alert("Failed to save product. Check console.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto slide-in-from-bottom-4 animate-in">
                <h2 className="text-xl font-bold mb-4">{product ? "Edit Product" : "Add New Product"}</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input id="productName" {...register("productName")} placeholder="e.g. Wireless Mouse" />
                        {errors.productName && <p className="text-sm text-red-500">{errors.productName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" {...register("sku")} placeholder="e.g. WM-001" />
                        {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <CategoryCombobox
                            categories={categories}
                            value={selectedCategoryId}
                            error={!!errors.categoryId}
                            onChange={(id) => setValue("categoryId", id, { shouldValidate: true })}
                            onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
                        />
                        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costPrice">Cost Price (LKR)</Label>
                            <Input
                                id="costPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                {...register("costPrice")}
                            />
                            {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unitPrice">Retail Price (LKR)</Label>
                            <Input
                                id="unitPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                {...register("unitPrice")}
                            />
                            {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stockQuantity">Initial Stock</Label>
                        <Input
                            id="stockQuantity"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            {...register("stockQuantity")}
                        />
                        {errors.stockQuantity && <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>}
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="active">Active Status</Label>
                            <p className="text-xs text-muted-foreground">
                                Make this product visible in the catalog.
                            </p>
                        </div>
                        <Switch
                            id="active"
                            checked={watch("active")}
                            onCheckedChange={(val) => setValue("active", val)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Product"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
