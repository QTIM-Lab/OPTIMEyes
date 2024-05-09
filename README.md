# OPTIMEyes Ophthalmology Annotation App

Purpose: Set up a static webpage and server to host classifier/pairwise comparator tasks for images 

I am not the original author of these files. This repository contains aggregated and updated files from previous developers. See acknowledgements below.


## Instructions for setup

* [Installation](https://github.com/QTIM-Lab/Image-Comparator/tree/master/Image-Comparator-Dockerfiles)

Once setup you should have two things running:
* Web Server
* Couchdb instance

![Initial Setup](./readme_images/initial_setup.jpg)


To finish configuring a single node setup, run the following;
```bash
APP_NAME=default
DB_PORT=5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=password
DB_NAME=image_comparator

# Create these 3 databases
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/_users
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/_replicator
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME
```

## Add some views to the db:
```
# Classify App
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/classifyApp -d @flask_server/image_comparator/static/js/views/classifyApp_views.json

# Compare App
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/compareApp -d @flask_server/image_comparator/static/js/views/compareApp_views.json

# Flicker App
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/flickerApp -d @flask_server/image_comparator/static/js/views/flickerApp_views.json

# Slider App
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/sliderApp -d @flask_server/image_comparator/static/js/views/sliderApp_views.json

# Monai Segmentation App
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/monaiSegmentationApp -d @flask_server/image_comparator/static/js/views/monaiSegmentationApp_views.json

# Images Views
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/images -d @flask_server/image_comparator/static/js/views/images_views.json

# Users Views
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/users -d @flask_server/image_comparator/static/js/views/users_views.json

# Tool Set Templates:
curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_examples.json

curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_classify_template.json

curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_compare_template.json

curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_flicker_template.json

curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_slider_template.json

curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME \
  -H 'Content-Type: application/json' \
  -d @flask_server/image_comparator/static/js/views/tool_set_monaiSegmentation_template.json
```

## Monai Label Integration (Optional):
You will need to deploy this Monai Label server implementation for a basic segmentation model: [QTIM - Segmentation Monai Label Server Repo](https://github.com/qtim-lab/segmentationmonailabel)

# Make sure you can hit the basic /info/ endpoint to test you can reach the sever
```bash
curl http://localhost:8000/info/
```

## HTTPS
### Certless
In ```Image-Comparator-Dockerfiles/README.md``` (at the bottom) you can run flask with adhoc certs:
```bash
# ...docker run command...
flask run --port $MACHINE_PORT --host 0.0.0.0 --cert=adhoc
```

### Self Signed
[blog.miguelgrinberg.com](https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https)

```bash
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365
mkdir flask_server/certs/
mv cert.pem flask_server/certs/
mv key.pem flask_server/certs/
```


### Certbot
[Certbot](https://certbot.eff.org/instructions?ws=other&os=ubuntufocal)
```bash
sudo snap install --classic certbot
sudo certbot certonly --standalone
DNS=

sudo cp /etc/letsencrypt/live/$DNS/fullchain.pem flask_server/certs
sudo cp /etc/letsencrypt/live/$DNS/privkey.pem flask_server/certs
```

## Acknowledgements

In the order they appear this project has been forked and added to. Yet again we fork to make a QTIM-Lab based project that will be adapted and maintained here.

1. Jayashree Kalpathy-Cramer, PhD for original source code (https://github.com/AlanCramer/Image-Comparator)  
2. Collin Wen (https://github.com/CollinWen/Image-Comparator.git)  
3. Collin Wen (https://github.com/CollinWen/Image-Comparator-Dockerfile)  
4. Jimmy chen (https://github.com/jche253/Fundus_Classifier_Comparator)  


## Contact
For questions, please contact:
* Benjamin Bearce, bbearce@gmail.com  
* Jayashree Kalpathy-Cramer, PhD kalpathy@nmr.mgh.harvard.edu  

