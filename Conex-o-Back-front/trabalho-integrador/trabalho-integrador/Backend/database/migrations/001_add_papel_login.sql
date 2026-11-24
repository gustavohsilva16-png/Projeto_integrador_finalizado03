-- Execute uma unica vez em bancos ja existentes, depois de fazer backup.
ALTER TABLE login
    ADD COLUMN papel ENUM('CLIENTE', 'ADMIN') NOT NULL DEFAULT 'CLIENTE';

-- Promova manualmente apenas uma conta verificada, substituindo o e-mail:
-- UPDATE login SET papel = 'ADMIN' WHERE email = 'EMAIL_VERIFICADO';
