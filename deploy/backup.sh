#!/bin/sh
# Respaldo periódico de Postgres con pg_dump, corriendo dentro de su propio contenedor.
# No depende solo del volumen de Docker: cada dump queda en ./backups en el VPS (fuera del volumen).
set -eu

BACKUP_DIR=/backups
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"

mkdir -p "$BACKUP_DIR"

while true; do
  stamp=$(date +%Y%m%d_%H%M%S)
  file="$BACKUP_DIR/${PGDATABASE}-${stamp}.sql.gz"
  echo "[backup] dumping $PGDATABASE -> $file"
  if pg_dump | gzip > "$file"; then
    echo "[backup] ok"
  else
    echo "[backup] FAILED, removing partial file" >&2
    rm -f "$file"
  fi
  find "$BACKUP_DIR" -name '*.sql.gz' -mtime "+$KEEP_DAYS" -delete
  sleep "$INTERVAL_SECONDS"
done
