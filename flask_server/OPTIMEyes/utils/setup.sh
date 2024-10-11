#!/bin/bash
sleep 5

# Ensure necessary variables are set
if [ -z "$DB_PORT" ] || [ -z "$COUCH_DB" ]; then
  echo "DB_PORT or DB_NAME is not set."
  exit 1
fi


views=("$COUCH_DB" "_users" "_replicator")
for view in "${views[@]}"; do
    curl -X GET http://$COUCHDB_USER:$COUCHDB_PASSWORD@couchdb:$DB_PORT/_all_dbs | grep -q "${view}"
    if [ $? -eq 0 ]; then
    echo "Database ${view} already exists."
    else
    curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@couchdb:$DB_PORT/${view}
    fi
done


# Upload design documents
views=("classifyApp" "compareApp" "flickerApp" "sliderApp" "monaiSegmentationApp" "images" "users")
for view in "${views[@]}"; do
  if [ -f /flask_server/OPTIMEyes/static/js/views/${view}_views.json ]; then
    curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@couchdb:$DB_PORT/$COUCH_DB/_design/$view \
      -d @/flask_server/OPTIMEyes/static/js/views/${view}_views.json
  else
    echo "File ${view}_views.json not found!"
  fi
done


# Upload template documents
templates=("tool_set_examples.json" "tool_set_classify_template.json" "tool_set_compare_template.json" "tool_set_flicker_template.json" "tool_set_slider_template.json" "tool_set_monaiSegmentation_template.json")

for template in "${templates[@]}"; do
  # Check if the file exists before attempting to upload
  if [ -f /flask_server/OPTIMEyes/static/js/views/$template ]; then
    curl -X POST http://$COUCHDB_USER:$COUCHDB_PASSWORD@couchdb:$DB_PORT/$COUCH_DB \
      -H 'Content-Type: application/json' \
      -d @/flask_server/OPTIMEyes/static/js/views/$template
    echo "Uploaded $template"
  else
    echo "File $template not found!"
  fi
done

# Run the web server
# Check if HTTP_PORT is 443
if [ "$HTTP_PORT" -eq 443 ]; then
    if [ "$DEPLOY" -eq "PROD" ]; then
        gunicorn -b 0.0.0.0:8080 "OPTIMEyes:create_app()" \
            --certfile=certs/cert.pem  \
            --keyfile=certs/key.pem
    else
        flask run --port 8080 --host=0.0.0.0 --cert=adhoc
    fi
else
    if [ "$DEPLOY" -eq "PROD" ]; then
        gunicorn -b 0.0.0.0:8080 "OPTIMEyes:create_app()"
    else
        flask run --port 8080 --host=0.0.0.0 --debug
    fi
fi
