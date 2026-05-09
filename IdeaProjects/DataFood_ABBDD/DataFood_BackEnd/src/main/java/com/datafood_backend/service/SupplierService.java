package com.datafood_backend.service;

import com.datafood_backend.dto.SupplierDTO;
import com.datafood_backend.model.Supplier;
import com.datafood_backend.model.SupplierAddress;
import com.datafood_backend.model.SupplierPhone;
import com.datafood_backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    // GET ALL
    public List<SupplierDTO> getAll() {
        return supplierRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET BY ID
    public SupplierDTO getById(Integer id) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found with id: " + id));

        return toDTO(supplier);
    }

    // CREATE
    @Transactional
    public SupplierDTO create(SupplierDTO dto) {

        Supplier supplier = new Supplier();

        supplier.setName(dto.getName());
        supplier.setCompany(dto.getCompany());
        supplier.setDescription(dto.getDescription());
        supplier.setStatus((byte) 1);

        // TELÉFONOS
        if (dto.getPhones() != null) {

            for (String phoneStr : dto.getPhones()) {

                if (phoneStr != null && !phoneStr.trim().isEmpty()) {

                    SupplierPhone p = new SupplierPhone();

                    p.setPhone(phoneStr.trim());

                    p.setSupplier(supplier);

                    supplier.getPhones().add(p);
                }
            }
        }

        // DIRECCIONES
        if (dto.getAddresses() != null) {

            for (String addrStr : dto.getAddresses()) {

                if (addrStr != null && !addrStr.trim().isEmpty()) {

                    SupplierAddress a = new SupplierAddress();

                    a.setAddress(addrStr.trim());

                    a.setSupplier(supplier);

                    supplier.getAddresses().add(a);
                }
            }
        }

        return toDTO(supplierRepository.save(supplier));
    }

    // UPDATE
    @Transactional
    public SupplierDTO update(Integer id, SupplierDTO dto) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found with id: " + id));

        supplier.setName(dto.getName());
        supplier.setCompany(dto.getCompany());
        supplier.setDescription(dto.getDescription());
        supplier.setStatus(dto.getStatus());

        // LIMPIAR TELÉFONOS ANTERIORES
        supplier.getPhones().clear();

        // NUEVOS TELÉFONOS
        if (dto.getPhones() != null) {

            for (String phoneStr : dto.getPhones()) {

                if (phoneStr != null && !phoneStr.trim().isEmpty()) {

                    phoneStr = phoneStr.trim();

                    if (!phoneStr.matches("\\d+")) {
                        throw new RuntimeException(
                                "El teléfono solo puede contener números");
                    }

                    if (phoneStr.length() != 8) {
                        throw new RuntimeException(
                                "El teléfono debe tener 8 dígitos");
                    }

                    SupplierPhone p = new SupplierPhone();

                    p.setPhone(phoneStr);

                    p.setSupplier(supplier);

                    supplier.getPhones().add(p);
                }
            }
        }

        // LIMPIAR DIRECCIONES
        supplier.getAddresses().clear();

        // NUEVAS DIRECCIONES
        List<SupplierAddress> addressesList = new ArrayList<>();

        if (dto.getAddresses() != null) {

            for (String addrStr : dto.getAddresses()) {

                if (addrStr != null && !addrStr.trim().isEmpty()) {

                    SupplierAddress a = new SupplierAddress();

                    a.setAddress(addrStr.trim());

                    a.setSupplier(supplier);

                    supplier.getAddresses().add(a);
                }
            }
        }

        return toDTO(supplierRepository.save(supplier));
    }

    // TOGGLE STATUS
    @Transactional
    public void toggleStatus(Integer id) {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found with id: " + id));

        supplier.setStatus(
                supplier.getStatus() == 1
                        ? (byte) 0
                        : (byte) 1
        );

        supplierRepository.save(supplier);
    }

    // ENTITY -> DTO
    private SupplierDTO toDTO(Supplier s) {

        SupplierDTO dto = new SupplierDTO();

        dto.setSupplierId(s.getSupplierId());
        dto.setName(s.getName());
        dto.setCompany(s.getCompany());
        dto.setDescription(s.getDescription());
        dto.setStatus(s.getStatus());

        if (s.getPhones() != null) {

            dto.setPhones(
                    s.getPhones()
                            .stream()
                            .map(SupplierPhone::getPhone)
                            .collect(Collectors.toList())
            );
        }

        if (s.getAddresses() != null) {

            dto.setAddresses(
                    s.getAddresses()
                            .stream()
                            .map(SupplierAddress::getAddress)
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}
