#!/bin/bash
# Uso: ./scripts/new-client.sh <slug-do-cliente> <dominio>
# Exemplo: ./scripts/new-client.sh cerro-azul cerroazul.gerenciar.app
#
# Roda no SERVIDOR, não localmente.
# Requer: docker, openssl

set -e

SLUG=$1
DOMAIN=$2

if [ -z "$SLUG" ] || [ -z "$DOMAIN" ]; then
  echo "Uso: $0 <slug> <dominio>"
  exit 1
fi

CLIENT_DIR="/opt/inventory/$SLUG"

if [ -d "$CLIENT_DIR" ]; then
  echo "Cliente '$SLUG' já existe em $CLIENT_DIR"
  exit 1
fi

echo "Criando cliente: $SLUG ($DOMAIN)"

mkdir -p "$CLIENT_DIR"

# Gera credenciais seguras
DB_PASSWORD=$(openssl rand -hex 24)
SECRET_KEY=$(openssl rand -hex 50)

# Cria o .env do cliente
cat > "$CLIENT_DIR/.env" <<EOF
POSTGRES_DB=inventory_${SLUG//-/_}
POSTGRES_USER=inv_${SLUG//-/_}
POSTGRES_PASSWORD=$DB_PASSWORD

DJANGO_SECRET_KEY=$SECRET_KEY
ALLOWED_HOSTS=$DOMAIN
CORS_ALLOWED_ORIGINS=http://$DOMAIN,https://$DOMAIN

GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-seu-usuario/Inventory-Control}
IMAGE_TAG=latest
EOF

# Copia o docker-compose de produção
cp "$(dirname "$0")/../docker-compose.prod.yml" "$CLIENT_DIR/docker-compose.prod.yml"

echo ""
echo "✓ Cliente criado em $CLIENT_DIR"
echo ""
echo "Próximos passos:"
echo "  1. cd $CLIENT_DIR"
echo "  2. docker compose -f docker-compose.prod.yml up -d"
echo "  3. Adicione os secrets no GitHub Actions:"
echo "     ${SLUG^^}_HOST, ${SLUG^^}_USER, ${SLUG^^}_SSH_KEY"
echo "     (substitua - por _ e use letras maiúsculas)"
