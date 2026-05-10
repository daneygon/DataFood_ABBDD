package com.datafood_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "Supplier")
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplierId")
    private Integer supplierId;

    @Column(name = "name", nullable = false, length = 45)
    private String name;

    @Column(name = "status", nullable = false)
    private Byte status = 1;

    @Column(name = "company", nullable = false, length = 45)
    private String company;

    @Column(name = "description", length = 45)
    private String description;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SupplierPhone> phones;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SupplierAddress> addresses;
}