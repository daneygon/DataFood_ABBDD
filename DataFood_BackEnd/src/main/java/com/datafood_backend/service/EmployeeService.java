package com.datafood_backend.service;

import com.datafood_backend.dto.EmployeeDTO;
import com.datafood_backend.model.Employee;
import com.datafood_backend.model.Position;
import com.datafood_backend.repository.EmployeeRepository;
import com.datafood_backend.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PositionRepository positionRepository;

    // GET ALL
    public List<EmployeeDTO> getAll() {
        return employeeRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // CREATE
    @Transactional
    public EmployeeDTO create(EmployeeDTO dto) {
        validateEmployeeData(dto);

        Position position = positionRepository.findByPositionName(dto.getRole().trim())
                .orElseThrow(() -> new RuntimeException("El cargo '" + dto.getRole() + "' no existe en la BD."));

        Employee employee = new Employee();
        employee.setFirstName(dto.getName().trim());
        employee.setLastName(dto.getLastName().trim());
        employee.setNationalId(dto.getDni().trim());
        employee.setEmail(dto.getEmail().trim());
        employee.setPhone(dto.getPhone().trim());
        employee.setSalary(dto.getSalary());
        employee.setPosition(position);
        employee.setStatus((byte) 1);

        employee.setPassword("DefaultPass123!"); // Contraseña por defecto

        return toDTO(employeeRepository.save(employee));
    }

    // UPDATE
    @Transactional
    public EmployeeDTO update(Integer id, EmployeeDTO dto) {
        validateEmployeeData(dto);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado."));

        Position position = positionRepository.findByPositionName(dto.getRole().trim())
                .orElseThrow(() -> new RuntimeException("El cargo '" + dto.getRole() + "' no existe en la BD."));

        employee.setFirstName(dto.getName().trim());
        employee.setLastName(dto.getLastName().trim());
        employee.setPhone(dto.getPhone().trim());
        employee.setSalary(dto.getSalary());
        employee.setPosition(position);

        return toDTO(employeeRepository.save(employee));
    }

    // TOGGLE STATUS
    @Transactional
    public void toggleStatus(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado."));

        employee.setStatus(employee.getStatus() == 1 ? (byte) 0 : (byte) 1);
        employeeRepository.save(employee);
    }

    // VALIDACIONES INTERNAS
    private void validateEmployeeData(EmployeeDTO dto) {
        if (dto.getName() == null || !dto.getName().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$")) {
            throw new RuntimeException("El nombre es obligatorio y solo debe contener letras.");
        }
        if (dto.getLastName() == null || !dto.getLastName().matches("^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$")) {
            throw new RuntimeException("El apellido es obligatorio y solo debe contener letras.");
        }
        if (dto.getPhone() == null || !dto.getPhone().matches("^\\d{4}-?\\d{4}$")) {
            throw new RuntimeException("Formato de teléfono inválido.");
        }
        if (dto.getSalary() == null || dto.getSalary().doubleValue() <= 0) {
            throw new RuntimeException("El salario debe ser mayor a 0.");
        }
        if (dto.getRole() == null || dto.getRole().trim().isEmpty()) {
            throw new RuntimeException("Debe seleccionar un cargo.");
        }
    }

    // ENTITY -> DTO
    private EmployeeDTO toDTO(Employee e) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(e.getEmployeeId());
        dto.setName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setDni(e.getNationalId());
        dto.setEmail(e.getEmail());
        dto.setPhone(e.getPhone());
        dto.setSalary(e.getSalary());
        dto.setStatus(e.getStatus());
        if (e.getPosition() != null) {
            dto.setRole(e.getPosition().getPositionName());
        }
        return dto;
    }
}