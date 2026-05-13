package com.datafood_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmployeeDTO {
    private Integer id;
    private String name;
    private String lastName;
    private String dni;
    private String email;
    private BigDecimal salary;
    private String role;
    private Byte status;
    private String phone;
}