# Instructions for setup

Create an environment variables file. Do not check .env into git.

```bash
cp .env_sample .env
```

Launch Start:
```bash
./start.sh
```

Stop:
```bash
./stop.sh
```

# Interact
Relaunch:
```bash
docker compose up -d
```

Logs:
```bash
docker compose logs -f # everything
docker compose logs -f flask
docker compose logs -f couchdb
docker compose logs -f monailabel
# If you need to rebuild just one
# docker compose build flask
# docker compose build couchdb
# docker compose build monailabel
```