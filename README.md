# OPTIMEyes Ophthalmology Annotation App

Purpose: Set up a static webpage and server to host tasks for images 


## Components:

* [Flask](https://flask.palletsprojects.com/en/3.0.x/) web server
* [CouchDB](https://couchdb.apache.org/) json document store (Persistence)  
* [Our](https://github.com/QTIM-Lab/segmentationMonaiLabel) [MonaiLabel](https://github.com/Project-MONAI/MONAILabel)
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
# If you need to rebuild just one
# docker compose build flask
# docker compose build couchdb
# docker compose build monailabel
```

### Mkdocs
```bash
# pyenv virtualenv 3.10.4 optimeyes
pyenv activate optimeyes
pip install -r requirements.txt
mkdocs new mkdocs_documentation
cd mkdocs_documentation
mkdocs serve
mkdocs build
mkdocs gh-deploy
```