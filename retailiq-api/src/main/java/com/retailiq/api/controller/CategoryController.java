package com.retailiq.api.controller;

import com.retailiq.api.entity.Category;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(categories, "Categories retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BAD_REQUEST", "Category name is required"));
        }
        Category category = new Category();
        category.setName(name.trim());
        Category saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(saved, "Category created"));
    }
}
