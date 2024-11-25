# OPTIMEyes Ophthalmology Annotation App

Purpose: Set up a static webpage and server to host tasks for images 

## Components:

* [Flask](https://flask.palletsprojects.com/en/3.0.x/) web server
* [CouchDB](https://couchdb.apache.org/) json document store (Persistence)  
* [Our](https://github.com/QTIM-Lab/segmentationMonaiLabel) [MonaiLabel](https://github.com/Project-MONAI/MONAILabel)
> See docker-compose.yml

## Instructions for setup
> [Documentation](https://qtim-lab.github.io/OPTIMEyes/)

Create an environment variables file. Do not check `.env` into git.
```bash
cp .env_sample .env
```

## Launch
Start:
```bash
./start.sh
```
Stop:
```bash
./stop.sh
```

