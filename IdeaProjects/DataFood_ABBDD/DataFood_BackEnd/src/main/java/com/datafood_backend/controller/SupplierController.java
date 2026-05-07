package com.datafood_backend.controller;

import com.datafood_backend.dto.SupplierDTO;
import com.datafood_backend.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public List<SupplierDTO> getAll() {
        return supplierService.getAll();
    }

    @GetMapping("/{id}")
    public SupplierDTO getById(@PathVariable Integer id) {
        return supplierService.getById(id);
    }

    @PostMapping
    public SupplierDTO create(@RequestBody SupplierDTO dto) {
        return supplierService.create(dto);
    }

    @PutMapping("/{id}")
    public SupplierDTO update(@PathVariable Integer id, @RequestBody SupplierDTO dto) {
        return supplierService.update(id, dto);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleStatus(@PathVariable Integer id) {
        supplierService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }
}
