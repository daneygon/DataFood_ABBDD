package com.datafood_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "Supplier")
public class Supplier {

    // Dentro de tu clase Supplier.java

    public void setPhones(List<SupplierPhone> phones) {
        this.phones = phones;
        if (phones != null) {
            phones.forEach(p -> p.setSupplier(this));
        }
    }

    public void setAddresses(List<SupplierAddress> addresses) {
        this.addresses = addresses;
        if (addresses != null) {
            for (SupplierAddress address : addresses) {
                address.setSupplier(this); // Esto vincula el hijo con el padre
            }
        }
    }


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
