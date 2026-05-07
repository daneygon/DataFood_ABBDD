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
    private Integer supplierId;

    @Column(nullable = false, length = 45)
    private String name;

    @Column(nullable = false)
    private Byte status = 1;

    @Column(nullable = false, length = 45)
    private String company;

    @Column(length = 45)
    private String description;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL)
    private List<SupplierPhone> phones;

    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL)
    private List<SupplierAddress> addresses;
}
