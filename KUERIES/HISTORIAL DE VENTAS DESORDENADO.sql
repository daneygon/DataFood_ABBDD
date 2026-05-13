select * from Employee

select * from SaleHeader

SELECT * FROM Position;

EXEC sp_rename 'Sale', 'SaleHeader';
EXEC sp_rename 'Sale.saleId', 'saleHeaderId', 'COLUMN';



USE DATAFOOD;
GO

-- =========================================================
-- CORREGIR SP_UpdateSale
-- =========================================================

IF OBJECT_ID('dbo.SP_UpdateSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_UpdateSale;
GO

CREATE PROCEDURE dbo.SP_UpdateSale
    @saleId         INT,
    @employeeId     INT = 1,
    @customerName   VARCHAR(100)  = NULL,
    @invoiceNumber  VARCHAR(30)   = NULL,
    @detailsJson    NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (
            SELECT 1
            FROM SaleHeader
            WHERE saleHeaderId = @saleId
        )
            THROW 51001, 'La venta no existe.', 1;

        IF EXISTS (
            SELECT 1
            FROM SaleHeader
            WHERE saleHeaderId = @saleId
              AND status = 'Anulado'
        )
            THROW 51002, 'No se puede editar una venta anulada.', 1;

        -- =========================================
        -- ACTUALIZAR CABECERA
        -- =========================================
        UPDATE SaleHeader
        SET
            customerName = ISNULL(@customerName, customerName),
            invoiceNumber = ISNULL(@invoiceNumber, invoiceNumber)
        WHERE saleHeaderId = @saleId;

        COMMIT TRANSACTION;

        SELECT @saleId AS saleHeaderId;

    END TRY
    BEGIN CATCH

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@msg, 16, 1);

    END CATCH
END;
GO


SELECT * FROM SaleHeader;


USE DATAFOOD;
GO

EXEC sp_rename 'SaleHeader.customerName', 'clientName', 'COLUMN';
GO

SELECT * FROM SaleHeader;
GO


USE DATAFOOD;
GO

IF COL_LENGTH('SaleHeader', 'isDelivery') IS NULL
BEGIN
    ALTER TABLE SaleHeader
    ADD isDelivery BIT NOT NULL DEFAULT 0;
END
GO

UPDATE SaleHeader
SET isDelivery = CASE 
    WHEN saleType = 'Domicilio' THEN 1 
    ELSE 0 
END;
GO


SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'SaleHeader';


USE DATAFOOD;
GO

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
            address = ISNULL(NULLIF(@address, ''), address),
            invoiceNumber = ISNULL(NULLIF(@invoiceNumber, ''), invoiceNumber)
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

USE DATAFOOD;
GO

IF OBJECT_ID('dbo.SP_CreateSale', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CreateSale;
GO

CREATE PROCEDURE dbo.SP_CreateSale
    @customerName NVARCHAR(100) = NULL,
    @address NVARCHAR(255) = NULL,
    @deliveryFee DECIMAL(10,2) = 0,
    @isDelivery BIT = 0,
    @employeeId INT = 1,
    @detailsJson NVARCHAR(MAX)
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


USE DATAFOOD;
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