# Image Comparator and Classifier

Purpose: Set up a static webpage and server to host classifier/pairwise comparator tasks for images 

I am not the original author of these files. This repository contains aggregated and updated files from previous developers. See acknowledgements below.


## Instructions for setup

* [Installation](https://github.com/QTIM-Lab/Image-Comparator/tree/master/Image-Comparator-Dockerfiles)

Once setup you should have two things running:
* Web Server
* Couchdb instance

![Initial Setup](./readme_images/initial_setup.jpg)


To finish configuring a single node setup, run the following;
```
APP_NAME=default
DB_PORT=5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=password

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/_users
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/_replicator

# Use below if in admin party mode:
# curl -X PUT http://0.0.0.0:$DB_PORT/_users
# curl -X PUT http://0.0.0.0:$DB_PORT/_replicator
```

To create and setup the database, run the following:
```
DB_NAME=image_comparator 

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME

# Admin party:
# curl -X PUT http://0.0.0.0:$DB_PORT/$DB_NAME
```

Add some views to the db:
```
curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/basic_views -d @flask_server/image_comparator/static/js/basic_views.json

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/classifyApp -d @flask_server/image_comparator/static/js/views/classifyApp_views.json

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/compareApp -d @flask_server/image_comparator/static/js/views/compareApp_views.json

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/images -d @flask_server/image_comparator/static/js/views/images_views.json

curl -X PUT http://$COUCHDB_USER:$COUCHDB_PASSWORD@0.0.0.0:$DB_PORT/$DB_NAME/_design/users -d @flask_server/image_comparator/static/js/views/users_views.json
```

### Add Images to DB:

```
docker exec -it -w $PWD image-comparator-flask-$APP_NAME bash
```

Place your imaging data in "Image-Comparator-Data". 

Ex:
```
root@a53f9696685a:/home/bb927/Image-Comparator# ls ../Image-Comparator-Data/
MR.1.dcm   MR.2.dcm  MR.3.dcm  MR.4.dcm
```


> If you want to supply the class of the image ahead of time, supply a csv in "Image-Comparator-Data" with image name and id like so:
```
image,class
MR.1.dcm,class_a
MR.2.dcm,class_b
MR.3.dcm,class_c
MR.4.dcm,class_a
...
```

Run addImages.py to add images:
```bash
python3 flask_server/image_comparator/utils/addImages.py <path to Image-Comparator-Data> <imageSetName> [<fromCSV>]
```

### Change flask_server/app/templates/base.html to have your users in this section:

```html
<!-- manually add users that you assigned tasks too in makeTasks.rb -->
<select id="username" onchange="{{ app_config.app }}TaskFeeder.OnSetUser(this.value)">
    <option selected="selected">Choose your user</option>
    <option value="Benjamin">Benjamin</option>
</select>
```

*With the app running, image list created and users in the drop down, you can proceed to configuring image lists for use within specific apps below*

## Apps

> You need to have created an image set already with "addImages.py". Go back to the "Add Images to DB" section above.

### Image-Comparator

#### Make Image Compare List:

```bash
python3 flask_server/image_comparator/utils/makeCompareList.py <imageSetName> <list name> <pct repeat>
```


### Image-Classifier

#### Make Image Classify List
```bash
python3 flask_server/image_comparator/utils/makeClassifyList.py <imageSet> <listName> <pctRepeat>
```

### Grid-Classifier
The grid app will make a grid of images with drop downs associated with each image. It is essentially a classify app in bulk in that you see all images at once and classify. 

It has the secondary option of being linked to the classify results themselves. In this version the grid is pre-poulated with the results from the classfiy phase. 

> Note: If using the linked version, be sure to change ```this.gridAppRedirect = true;``` in "flask_server/image_comparator/static/js/default.js"

#### Make Image Grid List
```bash
python3 flask_server/image_comparator/utils/makeGridList.py <imageSet> <listName> [<linkedToList>]
```


Using linked results we link to a previous classify list and associated task:
```bash
python3 flask_server/image_comparator/utils/makeGridList.py TEST TESTGridList TESTClassifyList
```

### Pair-Classifier

#### Make Pair Classifier List
```bash
python3 flask_server/image_comparator/utils/makePairList.py <imageSet> <listName>
```

### Add a task to a user for one of the Apps:
```bash
python3 flask_server/image_comparator/utils/makeTask.py <user> <image-list-name> <image-list-type> <task-order>
```

```bash
python3 flask_server/image_comparator/utils/makeTask.py Benjamin TESTCompareList compare 1
```

```bash
python3 flask_server/image_comparator/utils/makeTask.py Benjamin TESTClassifyList classify 1
```

```bash
python3 flask_server/image_comparator/utils/makeTask.py Benjamin TESTGridList grid 1
```

```bash
python3 flask_server/image_comparator/utils/makeTask.py Benjamin TESTPairList pair 1
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

