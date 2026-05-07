package com.datafood_backend.controller;

import com.datafood_backend.dto.SupplierDTO;
import com.datafood_backend.model.Supplier;
import com.datafood_backend.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "http://localhost:5173") // <--- CLAVE PARA QUE REACT PUEDA CONECTARSE
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @PostMapping
    public ResponseEntity<String> saveSupplier(@RequestBody SupplierDTO supplierDTO) {
        try {
            supplierService.createSupplier(supplierDTO);
            return ResponseEntity.ok("Proveedor guardado con éxito");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar: " + e.getMessage());
        }
    }

    // Agrégalo debajo de tu método saveSupplier
    @GetMapping
    public ResponseEntity<List<Supplier>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

}
