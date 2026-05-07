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

    @Column(nullable = false, length = 45)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "supplier_supplierId", nullable = false)
    private Supplier supplier;
}
