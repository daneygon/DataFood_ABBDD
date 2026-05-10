package com.datafood_backend.controller;

import com.datafood_backend.dto.ProductDTO;
import com.datafood_backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    /**
     * GET /api/products
     *
     * Query params opcionales (todos combinables):
     *   categoryId  → Integer  — filtra por ProductCategory
     *   status      → 1 | 0   — 1=ACTIVO, 0=INACTIVO
     *   search      → String   — búsqueda parcial por nombre
     *   sortAZ      → Boolean  — true ordena A-Z
     *
     * Ejemplos:
     *   GET /api/products
     *   GET /api/products?categoryId=2
     *   GET /api/products?search=pollo&sortAZ=true
     *   GET /api/products?categoryId=2&status=1&search=cerdo
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String  search,
            @RequestParam(required = false) Boolean sortAZ) {

        return ResponseEntity.ok(service.getAll(categoryId, status, search, sortAZ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@RequestBody ProductDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Integer id,
                                              @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    /**
     * PATCH /api/products/{id}/toggle-status
     * Alterna 1→0 o 0→1 (para el switch del frontend).
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ProductDTO> toggleStatus(@PathVariable Integer id) {
        return ResponseEntity.ok(service.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
