# OPTIMEyes Ophthalmology Annotation App

Purpose: Set up a static webpage and server to host tasks for images 


## Components:

* Flask docker container  
* CouchDB docker container  
> See docker-compose.yml

## Instructions for setup
Create an environment variables file. Do not check `.env` into git.
```bash
cp .env_sampe .env
```

### Launch
```bash
# No MonaiLabel
docker compose up -d
# With MonaiLabel
docker-compose -f docker-compose.yml -f docker-compose.monailabel.yml up --build

docker compose down # bring down
docker compose down; docker compose up -d
```

### Logs
```bash
docker compose logs -f flask
docker compose logs -f couchdb
```

### Interactive shell for flask
```bash
docker compose exec -it flask bash
```

### Purge DB
```bash
# DANGER
sudo rm -rf /opt/couchdb/data/
sudo rm -rf /opt/couchdb/data/.delete
sudo rm -rf /opt/couchdb/data/.share
```

### Load data


### SSL
#### Self signed
```bash
mkdir -p flask_server/certs/
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
mv cert.pem flask_server/certs/
mv key.pem flask_server/certs/
```
Echo what ever domain name you entered to `/etc/hosts`.

Ex: `optimeyes.co`
```bash
echo "0.0.0.0 optimeyes.co" | sudo tee -a /etc/hosts
```

#### Certbot (real purchased certs)
[certbot](https://certbot.eff.org/)
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --standalone

# When it expires in ~90 days
sudo certbot renew
```

You will get instructions on where it is on your machine. Copy to flask_server/certs folder.
