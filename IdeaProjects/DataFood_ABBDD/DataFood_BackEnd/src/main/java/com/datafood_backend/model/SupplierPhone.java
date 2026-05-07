package com.datafood_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "SupplierPhone")
public class SupplierPhone {




    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer supplierPhoneId;

    private String phone;

    // Haz esto en AMBOS (SupplierPhone y SupplierAddress)
    @ManyToOne
    @JoinColumn(name = "supplier_supplierId", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // <--- ESTO EVITA EL ERROR 500 AL GUARDAR
    private Supplier supplier;

}
