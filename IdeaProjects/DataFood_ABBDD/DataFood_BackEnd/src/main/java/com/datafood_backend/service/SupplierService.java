package com.datafood_backend.service;

import com.datafood_backend.dto.SupplierDTO;
import com.datafood_backend.model.Supplier;
import com.datafood_backend.model.SupplierAddress;
import com.datafood_backend.model.SupplierPhone;
import com.datafood_backend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierDTO> getAll() {
        return supplierRepository.findAllByOrderByNameAsc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public SupplierDTO getById(Integer id) {
        return toDTO(supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found")));
    }

    public SupplierDTO create(SupplierDTO dto) {
        Supplier supplier = toEntity(dto);
        return toDTO(supplierRepository.save(supplier));
    }

    public SupplierDTO update(Integer id, SupplierDTO dto) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        existing.setName(dto.getName());
        existing.setCompany(dto.getCompany());
        existing.setDescription(dto.getDescription());
        existing.setStatus(dto.getStatus());
        return toDTO(supplierRepository.save(existing));
    }

    public void toggleStatus(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setStatus(supplier.getStatus() == 1 ? (byte) 0 : (byte) 1);
        supplierRepository.save(supplier);
    }

    private SupplierDTO toDTO(Supplier s) {
        SupplierDTO dto = new SupplierDTO();
        dto.setSupplierId(s.getSupplierId());
        dto.setName(s.getName());
        dto.setCompany(s.getCompany());
        dto.setDescription(s.getDescription());
        dto.setStatus(s.getStatus());
        if (s.getPhones() != null)
            dto.setPhones(s.getPhones().stream().map(SupplierPhone::getPhone).collect(Collectors.toList()));
        if (s.getAddresses() != null)
            dto.setAddresses(s.getAddresses().stream().map(SupplierAddress::getAddress).collect(Collectors.toList()));
        return dto;
    }

    private Supplier toEntity(SupplierDTO dto) {
        Supplier s = new Supplier();
        s.setName(dto.getName());
        s.setCompany(dto.getCompany());
        s.setDescription(dto.getDescription());
        s.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);

        if (dto.getPhones() != null) {
            List<SupplierPhone> phones = dto.getPhones().stream().map(p -> {
                SupplierPhone sp = new SupplierPhone();
                sp.setPhone(p);
                sp.setSupplier(s);
                return sp;
            }).collect(Collectors.toList());
            s.setPhones(phones);
        }

        if (dto.getAddresses() != null) {
            List<SupplierAddress> addresses = dto.getAddresses().stream().map(a -> {
                SupplierAddress sa = new SupplierAddress();
                sa.setAddress(a);
                sa.setSupplier(s);
                return sa;
            }).collect(Collectors.toList());
            s.setAddresses(addresses);
        }
        return s;
    }
}
