USE DATAFOOD;
GO

/* =========================================================
   1. MIGRACIÓN DE NOMBRES BASE
   Ejecutar si la BD original todavía tiene Sale y saleId
========================================================= */

IF OBJECT_ID('dbo.SaleHeader', 'U') IS NULL
   AND OBJECT_ID('dbo.Sale', 'U') IS NOT NULL
BEGIN
    EXEC sp_rename 'Sale', 'SaleHeader';
END
GO

IF COL_LENGTH('SaleHeader', 'saleHeaderId') IS NULL
   AND COL_LENGTH('SaleHeader', 'saleId') IS NOT NULL
BEGIN
    EXEC sp_rename 'SaleHeader.saleId', 'saleHeaderId', 'COLUMN';
END
GO

IF COL_LENGTH('SaleHeader', 'clientName') IS NULL
   AND COL_LENGTH('SaleHeader', 'customerName') IS NOT NULL
BEGIN
    EXEC sp_rename 'SaleHeader.customerName', 'clientName', 'COLUMN';
END
GO


/* =========================================================
   2. COLUMNAS NECESARIAS PARA HISTORIAL DE VENTAS
========================================================= */

IF COL_LENGTH('SaleHeader', 'saleNumber') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD saleNumber AS (
        'V-' + RIGHT('000000' + CAST(saleHeaderId AS VARCHAR(6)), 6)
    );
END
GO

IF COL_LENGTH('SaleHeader', 'address') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD address VARCHAR(255) NULL;
END
GO

IF COL_LENGTH('SaleHeader', 'deliveryFee') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD deliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0;
END
GO

IF COL_LENGTH('SaleHeader', 'isDelivery') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD isDelivery BIT NOT NULL DEFAULT 0;
END
GO

IF COL_LENGTH('SaleHeader', 'status') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD status VARCHAR(20) NOT NULL DEFAULT 'Completado';
END
GO

IF COL_LENGTH('SaleHeader', 'invoiceNumber') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD invoiceNumber AS (
        'VTA-' 
        + CONVERT(CHAR(8), saleDate, 112)
        + '-'
        + RIGHT('000000' + CAST(saleHeaderId AS VARCHAR(6)), 6)
    );
END
GO

UPDATE SaleHeader
SET isDelivery = CASE 
    WHEN saleType = 'Domicilio' THEN 1 
    ELSE 0 
END;
GO


/* =========================================================
   3. TABLA DE HISTORIAL DE CAMBIOS DE VENTAS
========================================================= */

IF OBJECT_ID('dbo.SaleChangeLog', 'U') IS NULL
BEGIN
    CREATE TABLE SaleChangeLog (
        logId               INT IDENTITY(1,1) PRIMARY KEY,
        logDate             DATETIME     NOT NULL DEFAULT GETDATE(),
        action              VARCHAR(50)  NOT NULL,
        detail              VARCHAR(500) NOT NULL,
        saleHeader_id       INT          NOT NULL,
        employee_employeeId INT          NOT NULL,

        CONSTRAINT FK_SaleChangeLog_SaleHeader
            FOREIGN KEY (saleHeader_id)
            REFERENCES SaleHeader(saleHeaderId),

        CONSTRAINT FK_SaleChangeLog_Employee
            FOREIGN KEY (employee_employeeId)
            REFERENCES Employee(employeeId)
    );
END
GO


/* =========================================================
   4. SP_CreateSale
   Crear venta con nombres actuales
========================================================= */

IF OBJECT_ID('dbo.SP_CreateSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CreateSale;
GO

CREATE PROCEDURE dbo.SP_CreateSale
    @customerName NVARCHAR(100) = NULL,
    @address      NVARCHAR(255) = NULL,
    @deliveryFee  DECIMAL(10,2) = 0,
    @isDelivery   BIT = 0,
    @employeeId   INT = 1,
    @detailsJson  NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @subtotal DECIMAL(10,2);

        SELECT @subtotal = SUM(
            CAST(JSON_VALUE(value, '$.quantity') AS DECIMAL(10,2)) *
            CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2))
        )
        FROM OPENJSON(@detailsJson);

        IF @subtotal IS NULL
            SET @subtotal = 0;

        INSERT INTO SaleHeader (
            total,
            saleDate,
            saleType,
            clientName,
            employee_employeeId,
            address,
            deliveryFee,
            isDelivery,
            status
        )
        VALUES (
            @subtotal + ISNULL(@deliveryFee, 0),
            GETDATE(),
            CASE WHEN @isDelivery = 1 THEN 'Domicilio' ELSE 'Local' END,
            @customerName,
            @employeeId,
            @address,
            ISNULL(@deliveryFee, 0),
            @isDelivery,
            'Completado'
        );

        DECLARE @newSaleId INT = SCOPE_IDENTITY();

        INSERT INTO SaleDetail (
            quantity,
            subtotal,
            historicalPrice,
            sale_saleId,
            product_productId
        )
        SELECT
            CAST(JSON_VALUE(value, '$.quantity') AS DECIMAL(10,2)),
            CAST(JSON_VALUE(value, '$.quantity') AS DECIMAL(10,2)) *
            CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2)),
            CAST(JSON_VALUE(value, '$.unitPrice') AS DECIMAL(10,2)),
            @newSaleId,
            CAST(JSON_VALUE(value, '$.productId') AS INT)
        FROM OPENJSON(@detailsJson);

        COMMIT TRANSACTION;

        SELECT @newSaleId AS saleHeaderId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


/* =========================================================
   5. SP_UpdateSale
   Editar datos generales de la venta
========================================================= */

IF OBJECT_ID('dbo.SP_UpdateSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_UpdateSale;
GO

CREATE PROCEDURE dbo.SP_UpdateSale
    @saleId         INT,
    @employeeId     INT = 1,
    @customerName   VARCHAR(100) = NULL,
    @address        VARCHAR(255) = NULL,
    @invoiceNumber  VARCHAR(30) = NULL,
    @detailsJson    NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1 FROM SaleHeader WHERE saleHeaderId = @saleId
        )
            THROW 51001, 'La venta no existe.', 1;

        IF EXISTS (
            SELECT 1 FROM SaleHeader
            WHERE saleHeaderId = @saleId AND status = 'Anulado'
        )
            THROW 51002, 'No se puede editar una venta anulada.', 1;

        UPDATE SaleHeader
        SET
            clientName = ISNULL(NULLIF(@customerName, ''), clientName),
            address = ISNULL(NULLIF(@address, ''), address)
        WHERE saleHeaderId = @saleId;

        COMMIT TRANSACTION;

        SELECT @saleId AS saleHeaderId;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


/* =========================================================
   6. SP_CancelSale
   Anular venta y devolver stock
========================================================= */

IF OBJECT_ID('dbo.SP_CancelSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CancelSale;
GO

CREATE PROCEDURE dbo.SP_CancelSale
    @saleId     INT,
    @employeeId INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1 FROM SaleHeader WHERE saleHeaderId = @saleId
        )
            THROW 51003, 'La venta no existe.', 1;

        IF EXISTS (
            SELECT 1 FROM SaleHeader
            WHERE saleHeaderId = @saleId AND status = 'Anulado'
        )
            THROW 51004, 'La venta ya está anulada.', 1;

        UPDATE s
        SET s.availableQuantity = s.availableQuantity + sd.quantity
        FROM Supply s
        INNER JOIN SupplyProduct sp 
            ON s.supplyId = sp.supply_supplyId
        INNER JOIN SaleDetail sd 
            ON sp.product_productId = sd.product_productId
        WHERE sd.sale_saleId = @saleId;

        UPDATE SaleHeader
        SET status = 'Anulado'
        WHERE saleHeaderId = @saleId;

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


/* =========================================================
   7. VERIFICACIÓN FINAL
========================================================= */

SELECT
    saleHeaderId,
    saleNumber,
    invoiceNumber,
    saleDate,
    clientName,
    saleType,
    status,
    total,
    deliveryFee,
    isDelivery
FROM SaleHeader
ORDER BY saleDate DESC;
GO

SELECT COUNT(*) AS totalSaleLogs
FROM SaleChangeLog;
GO