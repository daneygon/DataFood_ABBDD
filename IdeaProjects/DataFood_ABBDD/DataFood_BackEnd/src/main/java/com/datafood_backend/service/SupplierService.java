package com.datafood_backend.service;

import com.datafood_backend.dto.SupplierDTO;
import com.datafood_backend.model.Supplier;
import com.datafood_backend.model.SupplierAddress;
import com.datafood_backend.model.SupplierPhone;
import com.datafood_backend.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Transactional
    public void createSupplier(SupplierDTO dto) {
        Supplier supplier = new Supplier();
        supplier.setName(dto.getName());
        supplier.setCompany(dto.getCompany());
        supplier.setDescription(dto.getDescription());
        supplier.setStatus((byte) 1);

        // Guardamos primero el padre para tener el ID (opcional pero más seguro)
        // O simplemente confiar en el Cascade si las listas están bien seteadas.

        List<SupplierPhone> phonesList = new ArrayList<>();
        if (dto.getPhones() != null) {
            for (String phoneStr : dto.getPhones()) {
                if (phoneStr != null && !phoneStr.trim().isEmpty()) {
                    SupplierPhone p = new SupplierPhone();
                    p.setPhone(phoneStr);
                    p.setSupplier(supplier);
                    phonesList.add(p);
                }
            }
        }
        supplier.setPhones(phonesList); // Lombok o tu método manual lo recibirán

        List<SupplierAddress> addressesList = new ArrayList<>();
        if (dto.getAddresses() != null) {
            for (String addrStr : dto.getAddresses()) {
                if (addrStr != null && !addrStr.trim().isEmpty()) {
                    SupplierAddress a = new SupplierAddress();
                    a.setAddress(addrStr);
                    a.setSupplier(supplier);
                    addressesList.add(a);
                }
            }
        }
        supplier.setAddresses(addressesList);

        supplierRepository.save(supplier);
    }

    // Agrégalo debajo de tu método createSupplier
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }
}
