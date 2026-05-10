package com.datafood_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreatePurchaseRequest {
    private Integer supplierId;
    private Integer employeeId;
    private String  paymentMethod;    // Efectivo | Tarjeta | Transferencia
    private String  invoiceNumber;
    private Double  taxRate;          // ej: 18.0
    private String  notes;
    // FIX #7: campo status que PurchaseService.update() necesita con req.getStatus()
    private String  status;           // Recibido | Pendiente | Anulado
    private List<PurchaseItemRequest> details;

    @Data
    public static class PurchaseItemRequest {
        private Integer supplyId;
        private Double  quantity;
        private Double  unitPrice;
    }
}