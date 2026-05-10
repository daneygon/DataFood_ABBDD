package com.datafood_backend.repository;

import com.datafood_backend.model.PurchaseHeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseHeaderRepository extends JpaRepository<PurchaseHeader, Integer> {

    // FIX #2: el bloque OR del search ahora está correctamente parentizado,
    // de lo contrario el segundo OR quedaba fuera del WHERE y siempre devolvía todo.
    @Query("SELECT p FROM PurchaseHeader p WHERE " +
            "(:supplierId IS NULL OR p.supplier.supplierId = :supplierId) AND " +
            "(:dateFrom IS NULL OR p.purchaseDate >= :dateFrom) AND " +
            "(:dateTo   IS NULL OR p.purchaseDate <= :dateTo) AND " +
            "(:search   IS NULL OR (" +
            "  LOWER(p.purchaseNumber) LIKE LOWER(CONCAT('%',:search,'%')) " +
            "  OR LOWER(p.supplier.name) LIKE LOWER(CONCAT('%',:search,'%'))" +
            "))")
    List<PurchaseHeader> filter(@Param("supplierId") Integer supplierId,
                                @Param("dateFrom")   LocalDateTime dateFrom,
                                @Param("dateTo")     LocalDateTime dateTo,
                                @Param("search")     String search);
}