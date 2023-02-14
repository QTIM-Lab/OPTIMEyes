import os
import sys
import couchdb
import pdb
# Not sure we are using
from PIL import Image
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

load_dotenv("flask_server/.env", verbose=True)
DB_ADMIN_USER = os.getenv("DB_ADMIN_USER")
DB_ADMIN_PASS = os.getenv("DB_ADMIN_PASS")
DNS = os.getenv("DNS")
IMAGE_COMPARATOR_DATA = os.getenv("IMAGE_COMPARATOR_DATA")
IMAGES_DB = os.getenv("IMAGES_DB")
DB_PORT = os.getenv("DB_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False

# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{DB_ADMIN_USER}:{DB_ADMIN_PASS}@{DNS}:{DB_PORT}')

def deleteClassifyImageListBasedOnImageList(imageListName: str):
    pass

def deleteCompareImageListBasedOnImageList(imageListName: str):
    pass

def deleteClassifyResults(imageListName: str):
    pass

def deleteCompareResults(imageListName: str):
    pass


def deleteImageList(imageListName: str):
    # Delete Image List
    db = couch[IMAGES_DB]
    imagesByList = db.iterview("images/imagesByList", 10, key=imageListName)
    count = 0
    image_ids = []
    for i in imagesByList:
        # pdb.set_trace()
        count += 1
        doc = db[i['id']]
        image_ids.append(i['id'])
        db.delete(doc)
    # pdb.set_trace()
    return json.dumps({"image_ids": image_ids, "count":count})
    # Delete Related App Image Lists
    # deleteClassifyImageListBasedOnImageList(imageListName)
    # deleteCompareImageListBasedOnImageList(imageListName)
    
    # Delete Related Results
    # deleteClassifyResults(imageListName)
    # deleteCompareResults(imageListName)


def main(imageListName: str):
    deleteImageList(imageListName)
   

if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except IndexError as err:
        raise Exception("* No imageList provided *")