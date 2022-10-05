import os
import sys
import requests
import json
import couchdb
import uuid
import pdb
import pprint as pp
import pandas as pd
from PIL import Image
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

# UTILS_DIR = "flask_server/image_comparator/utils"

load_dotenv("flask_server/.env", verbose=True)
DB_ADMIN_USER = os.getenv("DB_ADMIN_USER")
DB_ADMIN_PASS = os.getenv("DB_ADMIN_PASS")
DNS = os.getenv("DNS")
IMAGES_DB = os.getenv("IMAGES_DB")
DB_PORT = os.getenv("DB_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False
# pdb.set_trace()
# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{DB_ADMIN_USER}:{DB_ADMIN_PASS}@{DNS}:{DB_PORT}')


def main(path_to_images: str, imageSetName: str, fromCSV: str = None):
    # pdb.set_trace()
    # get images
    images_unfiltered = os.listdir(path_to_images)
    images = list(filter(lambda x: x.find(".jpg") != -
                  1 or x.find(".png") != -1, images_unfiltered))

    # We need to check current current image counts
    db = couch[IMAGES_DB]
    count_image_docs = [i for i in db.view("basic_views/count_image_docs")]
    imgCount = count_image_docs[0].value if len(count_image_docs) > 0 else 0

    # If from csv we need to get the extra column data and save it
    if fromCSV != None:
        images_csv = pd.read_csv(os.path.join(path_to_images, fromCSV))
        records = images_csv.to_dict(orient="records")
        for i, record in enumerate(records):
            t = datetime.now() - timedelta(hours=4)
            # mandatory fields
            # pdb.set_trace()
            record['_id'] = str(i+imgCount+1)
            record['origin'] = record.pop('image')
            record['id'] = str(uuid.uuid1())
            record['type'] = "imageDoc"
            record['imageSetName'] = imageSetName
            record['timeAdded'] = t.strftime('%Y-%m-%d %H:%M:%S')

            db.save(record)
            print(f"Saved record: {record['origin']}")
            image_content = open(os.path.join(
                path_to_images, record['origin']), "rb")
            image_extension = record['origin'].split(".")[-1]
            db.put_attachment(doc=record, content=image_content,
                              filename="image", content_type=f'image/{image_extension}')
            print(f"Added image attachment ({image_extension})")
            # pdb.set_trace()

    else:
        for i, image in enumerate(images):
            # pdb.set_trace()
            t = datetime.now() - timedelta(hours=4)
            obj = {"_id": str(i+imgCount+1),
                   "origin": image,
                   "id": str(uuid.uuid1()),
                   "type": "imageDoc",
                   "imageSetName": imageSetName,
                   "timeAdded": t.strftime('%Y-%m-%d %H:%M:%S')}

            db.save(obj)
            print(f"Saved record: {obj}")
            # image_content = Image.open(os.path.join(path_to_images,image))
            image_content = open(os.path.join(path_to_images, image), "rb")
            image_extension = image.split(".")[-1]
            db.put_attachment(doc=obj, content=image_content,
                              filename="image", content_type=f'image/{image_extension}')


if __name__ == "__main__":
    try:
        try:
            # pdb.set_trace()
            main(sys.argv[1], sys.argv[2], sys.argv[3])
            print("* csv used to help guide import *")
        except IndexError as err:
            print("* Assuming no csv to help guide import *")
            main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <path_to_images> or <imageSetName>, with optional [<fromCSV>]
        """)
