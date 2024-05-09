### Deploy couchdb docker image
Decide on a place to store the couchdb data. ```/opt/couchdb/data``` is where a normal couchdb installs will store data so don't use this directory in a docker mount unless you don't have couchdb installed on the machine already.
```
APP_NAME=dev
# DB_LOCATION=/opt/couchdb/data/$APP_NAME # default
DB_LOCATION=/sddata/app_or_generated_data/Image-Comparator/couchdb/data/$APP_NAME
mkdir -p $DB_LOCATION # if it doesn't exist already
echo $DB_LOCATION

# Change in production
COUCHDB_USER=admin
COUCHDB_PASSWORD=password
COUCH_PORT=5984

docker run \
 -p $COUCH_PORT:5984 \
 --name image-comparator-couchdb-$APP_NAME \
 -v $DB_LOCATION:/opt/couchdb/data \
 -d \
 -e COUCHDB_USER=$COUCHDB_USER \
 -e COUCHDB_PASSWORD=$COUCHDB_PASSWORD \
 couchdb:latest
```

> Note you can't make requests to this container wihtout making sure that CORS (cross-origin resource sharing) is enabled:

Once logged into couchdb goto settings to enable CORS:

![Initial Setup](../readme_images/couchdb_cors.jpg)

Create an Admin (if you delete them):
![create couch admin](../readme_images/couchdb_create_admin.jpg)

Debugging...

To shell into this container:
```
docker exec -it image-comparator-couchdb bash
```

To stop container (if needed):
```
docker stop image-comparator-couchdb
```

### Set up Image-Comparator in a Docker Container Using Flask

We will be using the *Dockerfile* file in ```Image-Comparator-Dockerfiles```.

#### Build the container

Build a new image for flask and serve in the context of the flask_server folder:
```bash
cd Image-Comparator-Dockerfiles
MACHINE_PORT="443"
MACHINE_PORT="8080"
CONTAINER_NAME=image-comparator
CONTAINER_TAG=flask

echo $MACHINE_PORT
echo $CONTAINER_NAME
echo $CONTAINER_TAG

docker build . -f Dockerfile --force-rm -t $CONTAINER_NAME:$CONTAINER_TAG

cd ../

docker run \
  -it \
  --rm \
  --network="host" \
  -p $MACHINE_PORT:8080 \
  -v $PWD/flask_server:/flask_server \
  -v $PWD/Image-Comparator-Data:/Image-Comparator-Data \
  -v $PWD:$PWD \
  -w /flask_server \
  -e FLASK_APP=OPTIMEyes \
  -e MACHINE_PORT=$MACHINE_PORT \
  --name image-comparator-flask-"$APP_NAME" \
  image-comparator:flask flask run --port $MACHINE_PORT --host 0.0.0.0 --debug
  # image-comparator:flask gunicorn -b 0.0.0.0:8080 "OPTIMEyes:create_app()"
  # image-comparator:flask bash
```

#### HTTPS
For some reason the --cert=adhoc not working that well
```bash
docker run \
  -it \
  --rm \
  --network="host" \
  -p $MACHINE_PORT:8080 \
  -v $PWD/flask_server:/flask_server \
  -v $PWD/Image-Comparator-Data:/Image-Comparator-Data \
  -v $PWD:$PWD \
  -w /flask_server \
  -e FLASK_APP=OPTIMEyes \
  -e MACHINE_PORT=$MACHINE_PORT \
  --name image-comparator-flask-"$APP_NAME" \
  image-comparator:flask flask run --port $MACHINE_PORT --host 0.0.0.0 --cert=adhoc
```

**self-signed certs**:  
```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
```

```bash
docker run \
  -it \
  --rm \
  --network="host" \
  -p $MACHINE_PORT:8080 \
  -v $PWD/flask_server:/flask_server \
  -v $PWD/Image-Comparator-Data:/Image-Comparator-Data \
  -v $PWD:$PWD \
  -w /flask_server \
  -e FLASK_APP=image_comparator \
  -e MACHINE_PORT=$MACHINE_PORT \
  --name image-comparator-flask-"$APP_NAME" \
  image-comparator:flask flask run --port $MACHINE_PORT --host 0.0.0.0 --cert=certs/cert.pem --key=certs/key.pem
```

To shell into this container:
```bash
docker exec -it image-comparator-flask-$APP_NAME bash
flask shell
```

```python
from image_comparator.auth_blueprint import load_user
from image_comparator.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']

user = load_user('user_guest')
user = load_user('user_bbearce')
user.set_password("password")
user.save(db)
```

# https://docs.google.com/spreadsheets/d/186tDQo-Uv2r9eMhXObW7O7FSEw40lEG0BZKO6wDWtCo/edit#gid=0
Reviewers of annotators in `user_pass` list below:
* Emily
* Aaron
* Tiarnan


```python
from image_comparator.auth_blueprint import load_user
from image_comparator.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']

user = load_user('user_nmanoharan')
user.set_password("nmanoharan_7TShGcqed5")
user.save(db)

user_pass=[
('bbearce', 'testtest'),
('guest', 'testtest')
]

for u, p in user_pass:
    print(u)
    print(p)


for u, p in user_pass:
    user = load_user(f'user_{u}')
    print(f'{u} {p}')
    user.set_password(p)
    user.save(db)



# head -c 16 /dev/urandom | base64
```

```bash
# certbot certs
# tbd
```

#### NGINX

