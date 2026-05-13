package com.datafood_backend.service;

import com.datafood_backend.dto.CreateSaleRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final JdbcTemplate jdbc;
    private final ObjectMapper objectMapper;

    @Transactional
    public Integer create(CreateSaleRequest req) {
        try {
            // Se serializan los detalles a JSON tal como los espera el SP
            String detailsJson = buildDetailsJson(req.getDetails());

            // Construcción del SQL alineado con los parámetros de tu SP:
            // @customerName, @address, @deliveryFee, @isDelivery, @employeeId, @detailsJson
            String sql = "EXEC SP_CreateSale "
                    + "@customerName = N'" + escapeSql(req.getClientName()) + "', "
                    + "@address = N'" + escapeSql(req.getAddress()) + "', "
                    + "@deliveryFee = " + (req.getDeliveryFee() != null ? req.getDeliveryFee() : 0.0) + ", "
                    + "@isDelivery = " + (req.getIsDelivery() != null && req.getIsDelivery() ? 1 : 0) + ", "
                    + "@employeeId = " + (req.getEmployeeId() != null ? req.getEmployeeId() : 1) + ", "
                    + "@detailsJson = N'" + escapeSql(detailsJson) + "'";

            // Retorna el saleHeaderId generado por el SELECT final del SP
            return jdbc.queryForObject(sql, Integer.class);

        } catch (Exception e) {
            // Si el trigger de stock negativo se dispara en SQL, el error llegará aquí
            throw new RuntimeException("Error al procesar la venta: " + e.getMessage());
        }
    }

    private String buildDetailsJson(List<CreateSaleRequest.SaleItemRequest> items) {
        if (items == null || items.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String escapeSql(String s) {
        if (s == null) return "";
        return s.replace("'", "''");
    }
}