package com.datafood_backend.controller;

import com.datafood_backend.dto.CreateSaleRequest;
import com.datafood_backend.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService service;

    @PostMapping
    public ResponseEntity<Map<String, Integer>> create(@RequestBody CreateSaleRequest req) {
        Integer id = service.create(req);
        return ResponseEntity.ok(Map.of("saleHeaderId", id));
    }
}