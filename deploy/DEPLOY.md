# Despliegue en un VPS (Ubuntu 22.04 / 24.04)

Todo el sitio (web de React + API) sale en **un solo archivo `backend.jar`**. Nginx recibe el tráfico
de internet con HTTPS y se lo pasa al jar, que escucha solo en `127.0.0.1:8080`. Los datos viven en PostgreSQL.

```
Internet ──HTTPS──> Nginx (80/443) ──> backend.jar (127.0.0.1:8080) ──> PostgreSQL (localhost)
```

## 0. Antes de empezar
- Un VPS con Ubuntu, acceso por SSH y 1 GB de RAM como mínimo.
- Un dominio con el registro DNS tipo **A** (`tudominio.com` y `www`) apuntando a la IP del VPS.

## 1. Preparar el servidor (una sola vez)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-21-jre-headless postgresql nginx certbot python3-certbot-nginx ufw

# Firewall: solo SSH y web
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

## 2. Base de datos
```bash
sudo -u postgres psql
```
```sql
CREATE USER rancho WITH PASSWORD 'UNA-CLAVE-LARGA-Y-UNICA';
CREATE DATABASE rancho OWNER rancho;
\q
```
Las tablas y el menú inicial los crea la aplicación sola al arrancar (Flyway).

## 3. Usuario y variables secretas
```bash
sudo useradd --system --home /opt/rancho --shell /usr/sbin/nologin rancho
sudo mkdir -p /opt/rancho/uploads && sudo chown -R rancho:rancho /opt/rancho   # uploads = fotos de los platillos
sudo nano /etc/rancho.env
```
Contenido de `/etc/rancho.env` (use sus propias claves):
```
SPRING_PROFILES_ACTIVE=prod
DB_URL=jdbc:postgresql://localhost:5432/rancho
DB_USER=rancho
DB_PASSWORD=UNA-CLAVE-LARGA-Y-UNICA
ADMIN_USER=admin
ADMIN_PASSWORD=OTRA-CLAVE-LARGA-PARA-EL-PANEL
UPLOADS_DIR=/opt/rancho/uploads
```
```bash
sudo chmod 600 /etc/rancho.env
```
En producción la aplicación **no arranca** si falta `ADMIN_PASSWORD`.

## 4. Construir el jar (en su computadora)
```bash
cd frontend && npm ci && npm run build      # genera la web en frontend/dist
cd ../backend && ./mvnw -DskipTests package # empaqueta todo en backend/target/backend-0.0.1-SNAPSHOT.jar
```
El orden importa: si no construye primero el frontend, el jar sale sin la web.

## 5. Subir y arrancar
```bash
scp backend/target/backend-0.0.1-SNAPSHOT.jar usuario@IP_DEL_VPS:/tmp/backend.jar
scp deploy/rancho.service deploy/nginx-rancho.conf usuario@IP_DEL_VPS:/tmp/
```
En el servidor:
```bash
sudo mv /tmp/backend.jar /opt/rancho/backend.jar && sudo chown rancho:rancho /opt/rancho/backend.jar
sudo mv /tmp/rancho.service /etc/systemd/system/rancho.service
sudo systemctl daemon-reload && sudo systemctl enable --now rancho
sudo systemctl status rancho          # debe decir "active (running)"
journalctl -u rancho -f               # ver los logs
```

## 6. Nginx y HTTPS
Edite `nginx-rancho.conf` y cambie `tudominio.com` por su dominio. Agregue esta línea en el bloque `http { }`
de `/etc/nginx/nginx.conf` (define el límite de intentos para el panel):
```
limit_req_zone $binary_remote_addr zone=rancho_admin:10m rate=10r/m;
```
```bash
sudo mv /tmp/nginx-rancho.conf /etc/nginx/sites-available/rancho
sudo ln -s /etc/nginx/sites-available/rancho /etc/nginx/sites-enabled/rancho
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com   # certificado HTTPS gratis, se renueva solo
```
Listo: https://tudominio.com y el panel en https://tudominio.com/admin

> El panel envía la clave en cada petición (HTTP Basic). Es seguro **solo con HTTPS**, así que no lo use
> por `http://` ni sin el paso de Certbot.

## 7. Actualizar el sitio
Repita el paso 4, suba el jar y reinicie:
```bash
scp backend/target/backend-0.0.1-SNAPSHOT.jar usuario@IP_DEL_VPS:/tmp/backend.jar
ssh usuario@IP_DEL_VPS 'sudo mv /tmp/backend.jar /opt/rancho/backend.jar && sudo chown rancho:rancho /opt/rancho/backend.jar && sudo systemctl restart rancho'
```
El menú y los precios que editó en el panel **no se pierden**: están en PostgreSQL, no en el jar. Las fotos de los platillos tampoco: están en `/opt/rancho/uploads`, fuera del jar.

## 8. Copias de seguridad
```bash
sudo -u postgres pg_dump rancho | gzip > rancho-$(date +%F).sql.gz
```
Las fotos de los platillos se guardan aparte, así que respáldelas también:
```bash
sudo tar czf rancho-fotos-$(date +%F).tar.gz -C /opt/rancho uploads
```
Programe ambos con `cron` y guarde las copias fuera del VPS.

## Checklist rápido
- [ ] DNS apunta a la IP del VPS
- [ ] Claves de `/etc/rancho.env` únicas y largas (no las de este ejemplo)
- [ ] `https://` funciona y `http://` redirige
- [ ] Mapa de Google actualizado en `frontend/src/config.ts` (`mapsEmbed`) antes de construir
- [ ] Fotos del local en `frontend/src/assets/local/` antes de construir (ver README)
- [ ] Copia de seguridad programada (base de datos y fotos)
