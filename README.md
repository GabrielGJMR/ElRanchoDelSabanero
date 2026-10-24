# El Rancho del Sabanero

Sitio web del restaurante (Liberia, Costa Rica): menú público y panel de administración.

- `backend/`: Spring Boot 4 + Java 21 + PostgreSQL (Flyway crea las tablas y carga el menú).
- `frontend/`: React + TypeScript (Vite), compilado como archivos estáticos y servido por su propio contenedor Nginx.

Todo es self-hosted: sin Cloudinary, S3, Supabase ni ningún otro servicio externo de pago. Las fotos
(platillos y galería del local) se guardan en disco, en un volumen de Docker. Ver `deploy/DEPLOY.md` para
el despliegue completo con Docker Compose en un VPS.

## Requisitos
- Java 21
- Node.js 20 o superior
- PostgreSQL con una base de datos llamada `rancho`
- Docker y Docker Compose (solo para correr todo junto como en producción, ver más abajo)

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
ADMIN_PASSWORD=tu-clave ./mvnw spring-boot:run     # API en http://localhost:8080
```
```bash
cd frontend
npm install        # solo la primera vez
npm run dev        # web en http://localhost:5173 (envía /api al backend)
```
(En PowerShell: `$env:ADMIN_PASSWORD="tu-clave"; ./mvnw spring-boot:run`)

Las fotos se guardan en `backend/uploads/` (configurable con `UPLOADS_DIR`), fuera del repositorio.

- Menú público: http://localhost:5173
- Administración: http://localhost:5173/admin (usuario `admin`)

`ADMIN_USER`/`ADMIN_PASSWORD` solo se usan para crear el primer usuario administrador, la primera vez
que arranca el backend (tabla `app_users` vacía). Después de eso ya no se vuelven a leer: los usuarios
se gestionan desde la pestaña "Usuarios" del panel (ver más abajo), y un restart no pisa la clave que
se haya cambiado desde ahí. Si no defines `ADMIN_PASSWORD` esa primera vez, se genera una clave
temporal y se imprime en la consola al arrancar.

## Correr todo junto con Docker Compose (como en producción)
```bash
cp .env.example .env    # complete DOMAIN, DB_PASSWORD, ADMIN_PASSWORD
docker compose up -d --build
```
Levanta Postgres, el backend, el frontend y Caddy (reverse proxy con HTTPS automático vía Let's Encrypt).
Detalles completos, variables de entorno y respaldos en `deploy/DEPLOY.md`.

## Páginas
`/` Inicio · `/menu` Menú · `/ubicacion` Ubicación (mapa de Google) · `/contacto` Contacto · `/admin` Administración

## Fotos
Todas las fotos (platillos y galería del local) se guardan en disco local, en el volumen `uploads` de
Docker (no en Cloudinary ni ningún otro servicio externo). El navegador las reduce a 1200 px antes de subirlas.
- **Fotos de los platillos:** botón `+` junto a cada platillo en `/admin`. Si un platillo no tiene foto, se
  muestra un recuadro con el escudo.
- **Fotos del local (sección "Así es el rancho" en Inicio):** sección "Fotos del local" al final de `/admin`.
  Suba o borre las que quiera, sin tocar código ni recompilar.

## Usuarios y roles
Pestaña "Usuarios" en `/admin` (solo visible para Admin). Dos roles:
- **Administrador**: acceso total, incluida la gestión de usuarios y la estructura de menús/categorías
  (crear, renombrar, borrar).
- **Editor**: solo el contenido del día a día — platillos, precios, disponibilidad y fotos (de platillos
  y de la galería). No puede borrar categorías/menús ni crear usuarios.

Los usuarios viven en la tabla `app_users` (con clave en hash, nunca en texto plano). Debe quedar
siempre al menos un Administrador: el backend no deja borrar el último ni el propio usuario logueado.

## API
| Ruta | Acceso |
|---|---|
| `GET /api/menu` | público |
| `GET /api/gallery` | público |
| `GET /api/admin/me` | admin o editor (quién soy, para saber mi rol) |
| `GET /api/admin/menu` | admin o editor (incluye platillos ocultos) |
| `POST/PUT/DELETE /api/admin/menus[/{id}]` | admin |
| `POST/DELETE /api/admin/categories[/{id}]`, `PUT /api/admin/categories/{id}` | admin |
| `POST/PUT/DELETE /api/admin/items[/{id}]` | admin o editor |
| `POST/DELETE /api/admin/items/{id}/image` | admin o editor (sube o quita la foto) |
| `POST/DELETE /api/admin/gallery[/{id}]` | admin o editor (foto del local) |
| `GET/POST/PUT/DELETE /api/admin/users[/{id}]` | admin |

## Pruebas
```bash
cd backend && ./mvnw test
```
Usan H2 en memoria, no necesitan PostgreSQL.

## Pendiente
- Registro e inicio de sesión opcional para clientes (tabla propia, distinta de `app_users`; rol
  `CUSTOMER`, rutas `/api/auth/**`).
