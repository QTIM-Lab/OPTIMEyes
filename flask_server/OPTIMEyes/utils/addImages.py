import os, pdb
import sys
import requests
import json
import couchdb
import uuid
import pdb
import pprint as pp
import pandas as pd
from PIL import Image
from datetime import datetime, timedelta
# from dotenv import load_dotenv

# UTILS_DIR = "flask_server/image_comparator/utils"

# load_dotenv("flask_server/.env", verbose=True)
COUCHDB_USER = os.getenv("COUCHDB_USER")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD")
DNS = os.getenv("DNS")
IMAGE_COMPARATOR_DATA = os.getenv("IMAGE_COMPARATOR_DATA")
COUCH_DB = os.getenv("COUCH_DB")
DB_PORT = os.getenv("DB_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False
# pdb.set_trace()
# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://couchdb:{DB_PORT}')
    # couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@couchdb:{DB_PORT}')
        # f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')


def getBase64Representation(image_id: str):
    pdb.set_trace()


def addImages(path_to_images: str, imageSetName: str, imageSetType: str = 'non-DICOM'):
    # get images
    # Sense csv for input
    # We need to check current current image counts
    db = couch[COUCH_DB]
    # If from csv we need to get the extra column data and save it
    if "image_key.csv" in os.listdir(os.path.join(IMAGE_COMPARATOR_DATA, path_to_images)):
        images_csv = pd.read_csv(os.path.join(IMAGE_COMPARATOR_DATA, path_to_images, "image_key.csv"))
        images_csv.head()
        images_csv['index'] = images_csv.index+1
        records = images_csv.to_dict(orient="records")
        for record in records:
            t = datetime.now() - timedelta(hours=4)
            # mandatory fields
            index = record['index']
            image_path_orig = record.pop('image_path_orig')
            # pdb.set_trace()
            try:
                relative_path = os.path.dirname(record.pop('relative_path'))
            except:
                relative_path = os.path.dirname(image_path_orig)
            basename = os.path.basename(image_path_orig)
            _id = imageSetName + "_" + relative_path.replace("/", "-") + "_" + basename
            record['_id'] = _id
            record['index'] = index
            record['image'] = basename
            record['image_orig_path'] = image_path_orig
            record['relative_path'] = relative_path
            record['type'] = "image"
            record['imageSetName'] = imageSetName
            record['timeAdded'] = t.strftime('%Y-%m-%d %H:%M:%S')
            db.save(record)
            print(f"Saved record: {record['image']}")
            # pdb.set_trace()            
            image_content = open(os.path.join(
                IMAGE_COMPARATOR_DATA, path_to_images, relative_path, basename), "rb")
            image_extension = basename.split(".")[-1]
            db.put_attachment(doc=record, content=image_content,
                              filename="image", content_type=f'image/{image_extension}')
            print(f"Added image attachment ({image_extension})")
            # getBase64Representation(_id)
    else:
        images_path = os.path.join(IMAGE_COMPARATOR_DATA, path_to_images)
        images_unfiltered = os.listdir(images_path)
        images = list(filter(lambda x: x.find(".jpg") != -1 \
                            or x.find(".png") != -1 \
                            or x.find(".bmp") != -1 \
                            or x.find(".tiff") != -1, \
                            images_unfiltered))
        for i, image in enumerate(images):
            # pdb.set_trace()
            t = datetime.now() - timedelta(hours=4)
            _id = imageSetName + "_" + image
            obj = {"_id": _id,
                   "image": image,
                   "type": "image",
                   "imageSetName": imageSetName,
                   "timeAdded": t.strftime('%Y-%m-%d %H:%M:%S')}

            db.save(obj)
            pdb.set_trace()
            print(f"Saved record: {record['image']}")
            image_content = open(os.path.join(
                images_path, record['image']), "rb")
            image_extension = image.split(".")[-1]
            db.put_attachment(doc=obj, content=image_content,
                              filename="image", content_type=f'image/{image_extension}')
            # getBase64Representation(_id)

def main(path_to_images: str, imageSetName: str, imageSetType: str = 'non-DICOM'):
    addImages(path_to_images, imageSetName, imageSetType)
   

if __name__ == "__main__":
    try:
        try:
            # pdb.set_trace()
            main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
            print("* csv used to help guide import*")
        except IndexError as err:
            print("* Assuming no csv to help guide import *")
            main(sys.argv[1], sys.argv[2], sys.argv[3])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <path_to_images> or <imageSetName>, with optional [<fromCSV>]
        """)
