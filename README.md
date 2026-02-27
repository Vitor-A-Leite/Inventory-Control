# Inventory Control

## Rodando com Docker (desenvolvimento)

1. Crie o arquivo de ambiente na raiz:

```bash
cp .env.example .env
```

2. Suba a aplicação e o banco:

```bash
docker compose up --build
```

3. A API ficará disponível em:

`http://localhost:8000`

## Comandos úteis

Subir em segundo plano:

```bash
docker compose up -d --build
```

Parar containers:

```bash
docker compose down
```

Parar e remover volume do Postgres (zera dados):

```bash
docker compose down -v
```

Executar comandos Django:

```bash
docker compose exec web python manage.py createsuperuser
docker compose exec web python manage.py test
```
