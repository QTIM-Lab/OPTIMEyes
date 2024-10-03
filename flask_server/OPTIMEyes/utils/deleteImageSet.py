import os
import sys
import couchdb
import pdb
# Not sure we are using
from PIL import Image
from datetime import datetime, timedelta
import json
# from dotenv import load_dotenv

# load_dotenv("flask_server/.env", verbose=True)
COUCHDB_USER = os.getenv("COUCHDB_USER")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD")
DNS = os.getenv("DNS")
IMAGE_COMPARATOR_DATA = os.getenv("IMAGE_COMPARATOR_DATA")
COUCH_DB = os.getenv("COUCH_DB")
DB_PORT = os.getenv("DB_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False

# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')

def deleteClassifyImageListBasedOnImageSet(imageSetName: str):
    pass

def deleteCompareImageListBasedOnImageSet(imageSetName: str):
    pass

def deleteClassifyResults(imageSetName: str):
    pass

def deleteCompareResults(imageSetName: str):
    pass


def deleteImageSet(imageSetName: str):
    # Delete Image Set
    db = couch[COUCH_DB]
    imagesBySet = db.iterview("images/imagesBySet", 10, key=imageSetName)
    count = 0
    image_ids = []
    for i in imagesBySet:
        # pdb.set_trace()
        count += 1
        doc = db[i['id']]
        image_ids.append(i['id'])
        db.delete(doc)
    # pdb.set_trace()
    return json.dumps({"image_ids": image_ids, "count":count})
    # Delete Related App Image Lists
    # deleteClassifyImageListBasedOnImageSet(imageSetName)
    # deleteCompareImageListBasedOnImageSet(imageSetName)
    
    # Delete Related Results
    # deleteClassifyResults(imageSetName)
    # deleteCompareResults(imageSetName)


def main(imageSetName: str):
    deleteImageSet(imageSetName)
   

if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except IndexError as err:
        raise Exception("* No imageSet provided *")