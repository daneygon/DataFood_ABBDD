package com.datafood_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "SupplierAddress")
public class SupplierAddress {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer supplierAddressId;

    @Column(nullable = false, length = 45)
    private String address;


    // Haz esto en AMBOS (SupplierPhone y SupplierAddress)
    @ManyToOne
    @JoinColumn(name = "supplier_supplierId", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // <--- ESTO EVITA EL ERROR 500 AL GUARDAR
    private Supplier supplier;

}
