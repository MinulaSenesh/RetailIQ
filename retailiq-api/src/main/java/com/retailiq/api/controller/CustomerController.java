package com.retailiq.api.controller;

import com.retailiq.api.entity.Customer;
import com.retailiq.api.exception.ApiResponse;
import com.retailiq.api.exception.ResourceNotFoundException;
import com.retailiq.api.repository.CustomerRepository;
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
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) String segment) {

        List<Customer> customers;
        if (segment != null && !segment.isBlank()) {
            customers = customerRepository.findAll().stream()
                    .filter(c -> segment.equalsIgnoreCase(c.getSegment()))
                    .toList();
        } else {
            Page<Customer> paged = customerRepository.findAll(
                    PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "customerId")));
            customers = paged.getContent();
        }
        return ResponseEntity.ok(ApiResponse.success(customers, "Customers retrieved"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getById(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer retrieved"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Customer>> create(@RequestBody Customer customer) {
        Customer saved = customerRepository.save(customer);
        auditService.logAction("CREATE", "customers", saved.getCustomerId(), "Created customer " + saved.getEmail());
        return ResponseEntity.ok(ApiResponse.success(saved, "Customer created"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Customer>> update(@PathVariable Long id, @RequestBody Customer updated) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customer.setFirstName(updated.getFirstName());
        customer.setLastName(updated.getLastName());
        customer.setPhone(updated.getPhone());
        customer.setCity(updated.getCity());
        customer.setCountry(updated.getCountry());

        Customer saved = customerRepository.save(customer);
        auditService.logAction("UPDATE", "customers", saved.getCustomerId(), "Updated customer details");

        return ResponseEntity.ok(ApiResponse.success(saved, "Customer updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!customerRepository.existsById(id))
            throw new ResourceNotFoundException("Customer", "id", id);
        customerRepository.deleteById(id);

        auditService.logAction("DELETE", "customers", id, "Deleted customer");

        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted"));
    }
}
