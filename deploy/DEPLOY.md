# Despliegue en un VPS (Docker Compose)

Todo corre en contenedores Docker en el mismo VPS: Postgres, el backend (API + fotos subidas), LibreTranslate
(traduce el menú a inglés/francés/chino), el frontend (web de React servida por Nginx) y Caddy como reverse
proxy con HTTPS automático (Let's Encrypt). No se usa ningún servicio externo de pago: ni Cloudinary, ni S3,
ni Supabase, ni una API de traducción de pago.

```
Internet ──HTTPS──> Caddy (80/443) ──┬─> backend (Postgres como base de datos, fotos en su propio volumen)
                                      │     └─> libretranslate (solo red interna, traduce el menú)
                                      └─> frontend (Nginx, web estática de React)
```

## 0. Antes de empezar
- Un VPS con Docker y Docker Compose instalados, 2 GB de RAM como mínimo (el servicio de traducción
  automática del menú, LibreTranslate, necesita memoria adicional para sus modelos de idioma).
- Un dominio con el registro DNS tipo **A** (`tudominio.com` y `www`) apuntando a la IP del VPS.

## 1. Instalar Docker (una sola vez)
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # cierre sesión y vuelva a entrar para que aplique
```

## 2. Copiar el proyecto y configurar variables
```bash
git clone <su-repo> /opt/rancho
cd /opt/rancho
cp .env.example .env
nano .env   # DOMAIN, DB_PASSWORD, ADMIN_USER, ADMIN_PASSWORD, BACKUP_KEEP_DAYS
```
Use claves largas y únicas para `DB_PASSWORD` y `ADMIN_PASSWORD` (no las del ejemplo).

## 3. Construir y arrancar todo
```bash
docker compose up -d --build
docker compose ps        # los 6 servicios deben decir "Up" (healthy en el caso de db)
docker compose logs -f backend   # ver los logs del backend
```
Flyway crea las tablas y el menú inicial solo, la primera vez que arranca el backend.

La primera vez que arranca, `libretranslate` descarga sus modelos de idioma (es/en/fr/zh, ~1-2 GB en total),
lo que puede tardar varios minutos según la conexión del VPS; mientras tanto el menú público simplemente se
muestra en español (sin traducciones todavía). Puede ver el progreso con
`docker compose logs -f libretranslate`. Es un servicio self-hosted: no necesita cuenta, API key, ni tiene
costo por uso; tampoco expone ningún puerto a internet, solo es alcanzable desde el backend dentro de la red
interna de Docker.

Caddy pide el certificado de Let's Encrypt automáticamente la primera vez que alguien visita el dominio
por HTTPS (no hace falta correr certbot a mano). Listo: `https://tudominio.com`, panel en `/admin`.

> El panel envía la clave en cada petición (HTTP Basic). Es seguro **solo con HTTPS**, que es lo que Caddy
> ya provee.

## 4. Actualizar el sitio
```bash
cd /opt/rancho
git pull
docker compose up -d --build
```
El menú, los precios y las fotos que suba desde el panel **no se pierden**: viven en los volúmenes nombrados
`db_data` y `uploads`, no en las imágenes de Docker, así que sobreviven a `--build` y a reinicios del VPS.

## 5. Copias de seguridad
El servicio `backup` corre `pg_dump` de la base de datos cada 24 h (configurable con `BACKUP_INTERVAL_SECONDS`)
y guarda los `.sql.gz` en `./backups` en el VPS (fuera del volumen de Docker), borrando los de más de
`BACKUP_KEEP_DAYS` días. Para forzar un respaldo manual:
```bash
docker compose exec backup sh -c 'pg_dump | gzip > /backups/manual-$(date +%F).sql.gz'
```
Copie `./backups` fuera del VPS de tanto en tanto (otro servidor, almacenamiento propio, etc.) — este
proyecto evita servicios externos de pago, pero un respaldo que solo vive en el mismo VPS no protege contra
la pérdida del VPS. Las fotos (volumen `uploads`) no tienen respaldo automático todavía: si quiere
respaldarlas, agregue `./backups/uploads` como destino de un `tar` periódico del volumen, o inclúyalas en
el mismo respaldo que use para `db_data`.

## Checklist rápido
- [ ] DNS apunta a la IP del VPS (A record para `tudominio.com` y `www`)
- [ ] `.env` tiene claves únicas y largas (no las del `.env.example`)
- [ ] `https://` funciona y el panel pide usuario/clave
- [ ] Mapa de Google actualizado en `frontend/src/config.ts` (`mapsEmbed`) antes de construir
- [ ] Respaldo de `./backups` copiado fuera del VPS periódicamente
