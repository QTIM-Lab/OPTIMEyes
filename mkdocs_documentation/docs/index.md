# Instructions for setup

## Launch
```bash
git clone git@github.com:QTIM-Lab/OPTIMEyes.git
cd OPTIMEyes
```
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

## Adjust CORS on Database
Default CouchDB credentials: [`admin`,`password`]
![CORS](load_data/couchdb_CORS.png)

## MonaiLabel
[monailabel](./monailabel.md)