package com.datafood_backend.dto;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PurchaseDetailDTO {
    private Integer    purchaseDetailId;
    private Integer    supplyId;
    private String     supplyName;
    private String     supplyCategory;
    private String     unitOfMeasure;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
