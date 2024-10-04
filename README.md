# OPTIMEyes Ophthalmology Annotation App

Purpose: Set up a static webpage and server to host tasks for images 


## Components:

* Flask docker container  
* CouchDB docker container  
> See docker-compose.yml

## Instructions for setup
Create an environment variables file. Do not check `.env` into git.
```bash
cp .env_sample .env
```

### Launch
Start:
```bash
./start.sh
```
Stop:
```bash
./stop.sh
```

### Interact
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
```

Interactive shell for flask:
```bash
docker compose exec -it flask bash
flask shell
```
then:
```python
from OPTIMEyes.auth_blueprint import load_user
from OPTIMEyes.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']
user = load_user('user_bbearce')
user.set_password("password")
user.save(db)
```

Download Annotations:
```python
from OPTIMEyes.routes_blueprint import downloadAnnotations
App="monaiSegmentation"
user = 'bbearce'
list_name =f'test_data-monaiSegmentation-0'
task_id = f"{user}-{list_name}"
zip_path = f"TMP/{user}-{list_name}.zip"
downloadAnnotations(App, task_id, cli=True, zip_path=zip_path)
```

Purge DB:
```bash
# DANGER
sudo rm -rf /opt/couchdb/data/
sudo rm -rf /opt/couchdb/data/.delete
sudo rm -rf /opt/couchdb/data/.share
```

### Load data

TBD...



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
