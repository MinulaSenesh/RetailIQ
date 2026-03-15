package com.retailiq.api.controller;

import com.retailiq.api.entity.Product;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.exception.ResourceNotFoundException;
import com.retailiq.api.repository.ProductRepository;
import com.retailiq.api.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<Product> products = productRepository.findByActiveTrue(
                PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "productId")));
        return ResponseEntity.ok(ApiResponse.success(
                products.getContent(),
                "Products retrieved — page " + page + " of " + products.getTotalPages()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return ResponseEntity.ok(ApiResponse.success(product, "Product retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Product>> create(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        auditService.logAction("CREATE", "products", saved.getProductId(), "Created product " + saved.getProductName());
        return ResponseEntity.ok(ApiResponse.success(saved, "Product created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Product>> update(@PathVariable Long id, @RequestBody Product updated) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setProductName(updated.getProductName());
        product.setUnitPrice(updated.getUnitPrice());
        product.setCostPrice(updated.getCostPrice());
        product.setStockQuantity(updated.getStockQuantity());
        product.setActive(updated.isActive());
        if (updated.getCategory() != null) {
            product.setCategory(updated.getCategory());
        }

        Product saved = productRepository.save(product);
        auditService.logAction("UPDATE", "products", saved.getProductId(), "Updated product details");

        return ResponseEntity.ok(ApiResponse.success(saved, "Product updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // Soft delete: mark inactive instead of hard delete to preserve FK integrity
        // (order_items and inventory_log reference products via FK)
        product.setActive(false);
        productRepository.save(product);

        auditService.logAction("DELETE", "products", id, "Soft-deleted product (marked inactive)");

        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
