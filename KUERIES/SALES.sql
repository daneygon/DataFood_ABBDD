
--EJECUTA UNO POR UNO--

USE DATAFOOD
-- AGREGANDO NUMERO DE TELEFONO A EMPLEADOS
ALTER TABLE Employee 
ADD phone VARCHAR(20) NOT NULL DEFAULT '0000-0000';
GO

-----para employees
INSERT INTO Position(positionName)
VALUES
('Cajero'),
('Cocinero'),
('Motociclista');


--direccion de venta domicilio
use DATAFOOD
ALTER TABLE Sale ADD address VARCHAR(255)




--CAMBIO DE DECIMAL
USE DATAFOOD;
GO

-- 1. Eliminar la restricción que impide el cambio
-- El nombre exacto según tu imagen es CK__SaleDetai__quant__6C190EBB
ALTER TABLE SaleDetail DROP CONSTRAINT CK__SaleDetai__quant__6C190EBB;
GO

-- 2. Ahora sí, cambiar la columna a DECIMAL
ALTER TABLE SaleDetail ALTER COLUMN quantity DECIMAL(10,3);
GO

-- 3. Volver a agregar la restricción de que sea mayor a cero
ALTER TABLE SaleDetail ADD CONSTRAINT CK_SaleDetail_Quantity_Positiva CHECK (quantity > 0);
GO




--EJECUTA ESTO PRIMERO--
USE DATAFOOD;
GO

IF OBJECT_ID('dbo.SP_CreateSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CreateSale;
GO

CREATE PROCEDURE dbo.SP_CreateSale
    @customerName   VARCHAR(45) = NULL,
    @address        VARCHAR(255) = NULL, -- Se guarda en el log o campo extendido
    @deliveryFee    DECIMAL(10,2) = 0,
    @isDelivery     BIT = 0,
    @employeeId     INT,
    @detailsJson    NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Tabla temporal para procesar el JSON
        DECLARE @saleDetails TABLE (
            productId INT,
            quantity  INT,
            unitPrice DECIMAL(10,2),
            subtotal  DECIMAL(10,2)
        );

        INSERT INTO @saleDetails
        SELECT 
            JSON_VALUE(value, '$.productId'),
            CAST(JSON_VALUE(value, '$.quantity') AS INT),
            CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2)),
            CAST(JSON_VALUE(value, '$.quantity') AS INT) * CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2))
        FROM OPENJSON(@detailsJson);

        -- Validación: Al menos un producto
        IF NOT EXISTS (SELECT 1 FROM @saleDetails)
        BEGIN
            THROW 51000, 'La venta debe tener al menos un producto.', 1;
        END

        -- 2. Calcular Totales
        DECLARE @totalVenta DECIMAL(10,2);
        SELECT @totalVenta = SUM(subtotal) FROM @saleDetails;
        SET @totalVenta = @totalVenta + @deliveryFee;

        -- 3. Insertar Cabecera de Venta
        DECLARE @newSaleId INT;
        INSERT INTO Sale (
            total,
            saleDate,
            saleType,
            customerName,
            employee_employeeId
        )
        VALUES (
            @totalVenta,
            GETDATE(),
            CASE WHEN @isDelivery = 1 THEN 'Domicilio' ELSE 'Local' END,
            @customerName,
            @employeeId
        );

        SET @newSaleId = SCOPE_IDENTITY();

        -- 4. Insertar Detalles de Venta
        INSERT INTO SaleDetail (
            quantity,
            subtotal,
            historicalPrice,
            sale_saleId,
            product_productId
        )
        SELECT 
            quantity,
            subtotal,
            unitPrice,
            @newSaleId,
            productId
        FROM @saleDetails;

        -- 5. ACTUALIZAR STOCK DE PRODUCTOS (Platillos preparados)
        UPDATE p
        SET p.status = CASE WHEN (p.productId > 0) THEN 1 ELSE 1 END -- Aquí podrías manejar lógica de disponibilidad
        FROM Product p
        INNER JOIN @saleDetails sd ON p.productId = sd.productId;

        -- 6. DESCONTAR INSUMOS (Basado en la tabla SupplyProduct)
        -- Nota: Esto descuenta 1 unidad de cada insumo relacionado por cada producto vendido
        UPDATE s
        SET s.availableQuantity = s.availableQuantity - (sd.quantity)
        FROM Supply s
        INNER JOIN SupplyProduct sp ON s.supplyId = sp.supply_supplyId
        INNER JOIN @saleDetails sd ON sp.product_productId = sd.productId;

        -- 7. Verificación de Stock Negativo (Dispara el trigger trg_PreventNegativeStock)
        -- Si algún insumo queda en negativo, el trigger que ya tienes hará ROLLBACK automáticamente.

        COMMIT TRANSACTION;

        -- Retornar el ID para el Backend
        SELECT @newSaleId AS saleHeaderId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO







--DESPUES ESTO--
USE DATAFOOD;
GO

ALTER PROCEDURE dbo.SP_CreateSale
    @customerName   VARCHAR(45) = NULL,
    @address        VARCHAR(255) = NULL,
    @deliveryFee    DECIMAL(10,2) = 0,
    @isDelivery     BIT = 0,
    @employeeId     INT,
    @detailsJson    NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @saleDetails TABLE (
            productId INT,
            quantity  DECIMAL(10,3), -- CAMBIADO: Antes era INT, ahora acepta decimales del JSON
            unitPrice DECIMAL(10,2),
            subtotal  DECIMAL(10,2)
        );

        -- Procesar JSON: Usamos DECIMAL en lugar de INT para la cantidad
        INSERT INTO @saleDetails
        SELECT 
            JSON_VALUE(value, '$.productId'),
            CAST(JSON_VALUE(value, '$.quantity') AS DECIMAL(10,3)), -- CAMBIADO
            CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2)),
            CAST(JSON_VALUE(value, '$.quantity') AS DECIMAL(10,3)) * CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2))
        FROM OPENJSON(@detailsJson);

        IF NOT EXISTS (SELECT 1 FROM @saleDetails)
            THROW 51000, 'La venta debe tener al menos un producto.', 1;

        DECLARE @totalVenta DECIMAL(10,2);
        SELECT @totalVenta = SUM(subtotal) FROM @saleDetails;
        SET @totalVenta = @totalVenta + @deliveryFee;

        DECLARE @newSaleId INT;
        INSERT INTO Sale (total, saleDate, saleType, customerName, employee_employeeId, address)
        VALUES (@totalVenta, GETDATE(), CASE WHEN @isDelivery = 1 THEN 'Domicilio' ELSE 'Local' END, @customerName, @employeeId, @address);

        SET @newSaleId = SCOPE_IDENTITY();

        INSERT INTO SaleDetail (quantity, subtotal, historicalPrice, sale_saleId, product_productId)
        SELECT quantity, subtotal, unitPrice, @newSaleId, productId FROM @saleDetails;

        -- Actualizar stock de insumos
        UPDATE s
        SET s.availableQuantity = s.availableQuantity - sd.quantity
        FROM Supply s
        INNER JOIN SupplyProduct sp ON s.supplyId = sp.supply_supplyId
        INNER JOIN @saleDetails sd ON sp.product_productId = sd.productId;

        COMMIT TRANSACTION;
        SELECT @newSaleId AS saleHeaderId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END
GO




----------------------------------------------------------------------

EXEC sp_rename 'Sale', 'SaleHeader';
EXEC sp_rename 'Sale.saleId', 'saleHeaderId', 'COLUMN';
GO

