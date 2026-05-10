package com.datafood_backend.model;

import jakarta.persistence.*;
import lombok.Data;

/**
 * FIX #6: Este modelo faltaba en el proyecto.
 * PurchaseHeader, PurchaseChangeLog y StockAdjustment referencian Employee.
 * Mapea la tabla Employee del SQL (solo los campos que el backend necesita por ahora).
 */
@Data
@Entity
@Table(name = "Employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employeeId")
    private Integer employeeId;

    @Column(name = "firstName", nullable = false, length = 45)
    private String firstName;

    @Column(name = "lastName", nullable = false, length = 45)
    private String lastName;

    @Column(name = "email", nullable = false, length = 45, unique = true)
    private String email;

    @Column(name = "nationalId", nullable = false, length = 45, unique = true)
    private String nationalId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "status", nullable = false)
    private Byte status = 1;

    @Column(name = "salary", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal salary;

    // Relación con Position (tabla Position del SQL)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_positionId", nullable = false)
    private Position position;
}