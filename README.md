# El Rancho del Sabanero

Sitio web del restaurante (Liberia, Costa Rica): menú público y panel de administración.

- `backend/`: Spring Boot 4 + Java 21 + PostgreSQL (Flyway crea las tablas y carga el menú).
- `frontend/`: React + TypeScript (Vite). Al hacer `npm run build`, Maven empaqueta `frontend/dist` dentro del backend, así que todo se sirve desde un solo puerto.

## Requisitos
- Java 21
- Node.js 20 o superior
- PostgreSQL con una base de datos llamada `rancho`
- Una cuenta de [Cloudinary](https://cloudinary.com) (gratis) para las fotos

## Base de datos (una sola vez)
Con PostgreSQL instalado, crea la base de datos:
```sql
CREATE DATABASE rancho;
```
Por defecto el backend usa `postgres` / `dev` en `localhost:5432`. Para cambiarlo define `DB_URL`, `DB_USER` y `DB_PASSWORD`.

## Correr en desarrollo (con recarga automática)
Dos terminales:
```bash
cd backend
ADMIN_PASSWORD=tu-clave \
CLOUDINARY_CLOUD_NAME=tu-cloud-name CLOUDINARY_API_KEY=tu-api-key CLOUDINARY_API_SECRET=tu-api-secret \
./mvnw spring-boot:run     # API en http://localhost:8080
```
```bash
cd frontend
npm install        # solo la primera vez
npm run dev        # web en http://localhost:5173 (envía /api al backend)
```
(En PowerShell: `$env:ADMIN_PASSWORD="tu-clave"; $env:CLOUDINARY_CLOUD_NAME="..."; $env:CLOUDINARY_API_KEY="..."; $env:CLOUDINARY_API_SECRET="..."; ./mvnw spring-boot:run`)

Sin las variables de Cloudinary el backend arranca igual (útil si solo va a tocar el menú), pero subir o
borrar fotos falla hasta que las defina. Los 3 valores están en el Dashboard de cloudinary.com, cuenta gratis.

- Menú público: http://localhost:5173
- Administración: http://localhost:5173/admin (usuario `admin`)

Si no defines `ADMIN_PASSWORD`, se genera una clave temporal y se imprime en la consola al arrancar.

## Correr todo junto (como en producción)
```bash
cd frontend && npm install && npm run build
cd ../backend && ./mvnw spring-boot:run
```
La web y la API quedan en http://localhost:8080 (administración en `/admin`).

## Páginas
`/` Inicio · `/menu` Menú · `/ubicacion` Ubicación (mapa de Google) · `/contacto` Contacto · `/admin` Administración

## Fotos
Todas las fotos (platillos y galería del local) se guardan en **Cloudinary**, no en el repositorio ni en el
servidor. El navegador las reduce a 1200 px antes de subirlas.
- **Fotos de los platillos:** botón `+` junto a cada platillo en `/admin`. Si un platillo no tiene foto, se
  muestra un recuadro con el escudo.
- **Fotos del local (sección "Así es el rancho" en Inicio):** sección "Fotos del local" al final de `/admin`.
  Suba o borre las que quiera, sin tocar código ni recompilar.

## API
| Ruta | Acceso |
|---|---|
| `GET /api/menu` | público |
| `GET /api/gallery` | público |
| `GET /api/admin/menu` | admin (incluye platillos ocultos) |
| `POST/PUT/DELETE /api/admin/categories[/{id}]` | admin |
| `POST/PUT/DELETE /api/admin/items[/{id}]` | admin |
| `POST/DELETE /api/admin/items/{id}/image` | admin (sube o quita la foto) |
| `POST/DELETE /api/admin/gallery[/{id}]` | admin (foto del local) |

## Pruebas
```bash
cd backend && ./mvnw test
```
Usan H2 en memoria, no necesitan PostgreSQL.

## Pendiente
- Registro e inicio de sesión opcional para clientes (tabla `users`, rol `CUSTOMER`, rutas `/api/auth/**`).
