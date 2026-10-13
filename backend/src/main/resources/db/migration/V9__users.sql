-- Usuarios del panel de administración (no confundir con clientes: ver nota en SecurityConfig).
-- Se llama "app_users" (no "users") para no chocar el día que se agregue una tabla de clientes.
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
