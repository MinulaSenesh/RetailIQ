declare module "@/utils/productImages" {
    import { Product } from "@/types";
    export function getProductImage(category: string, productId?: number, product?: Product): string;
    export function getFallbackLabel(category: string): string;
}
