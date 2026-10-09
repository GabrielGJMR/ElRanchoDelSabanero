# El Rancho del Sabanero

Sitio web del restaurante (Liberia, Costa Rica): menú público y panel de administración.

- `backend/`: Spring Boot 4 + Java 21 + PostgreSQL (Flyway crea las tablas y carga el menú).
- `frontend/`: HTML, CSS y JS simples. Maven los empaqueta dentro del backend, así que todo se sirve desde un solo puerto.

## Requisitos
- Java 21
- PostgreSQL con una base de datos llamada `rancho`

## Base de datos (una sola vez)
Con PostgreSQL instalado, crea la base de datos:
```sql
CREATE DATABASE rancho;
```
Por defecto el backend usa `postgres` / `dev` en `localhost:5432`. Para cambiarlo define `DB_URL`, `DB_USER` y `DB_PASSWORD`.

## Correr
```bash
cd backend
ADMIN_PASSWORD=tu-clave ./mvnw spring-boot:run
```
(En PowerShell: `$env:ADMIN_PASSWORD="tu-clave"; ./mvnw spring-boot:run`)

- Menú público: http://localhost:8080
- Administración: http://localhost:8080/admin.html (usuario `admin`)

Si no defines `ADMIN_PASSWORD`, se genera una clave temporal y se imprime en la consola al arrancar.

## API
| Ruta | Acceso |
|---|---|
| `GET /api/menu` | público |
| `GET /api/admin/menu` | admin (incluye platillos ocultos) |
| `POST/PUT/DELETE /api/admin/categories[/{id}]` | admin |
| `POST/PUT/DELETE /api/admin/items[/{id}]` | admin |

## Pruebas
```bash
cd backend && ./mvnw test
```
Usan H2 en memoria, no necesitan PostgreSQL.

## Pendiente
- Registro e inicio de sesión opcional para clientes (tabla `users`, rol `CUSTOMER`, rutas `/api/auth/**`).
- Fotos de los platillos y logo.
