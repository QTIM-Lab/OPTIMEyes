# require 'net/http'
# require 'uri'
# require 'json'

import os
import sys
import requests
import json
import couchdb
import uuid
import pdb
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv("flask_server/.env", verbose=True)

DB_ADMIN_USER = os.getenv("DB_ADMIN_USER")
DB_ADMIN_PASS = os.getenv("DB_ADMIN_PASS")
DNS = os.getenv("DNS")
IMAGES_DB = os.getenv("IMAGES_DB")
DB_PORT = os.getenv("DB_PORT")
HTTP_PORT = os.getenv("HTTP_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False

# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{DB_ADMIN_USER}:{DB_ADMIN_PASS}@{DNS}:{DB_PORT}')

# couch package ex for later
    # db = couch[IMAGES_DB]
    # imageIDs = [int(row['id']) for row in db.view('_design/basic_views/_view/imageSet2ImageId')]
    # imageIDs.sort()
    # imageIDs = [str(i) for i in imageIDs]


def getURL(imageSet: str) -> str:
    url = f"http://{DNS}:{DB_PORT}/{IMAGES_DB}"
    view = f'/_design/basic_views/_view/imageSet2ImageId?key="{imageSet}"'
    URL = url + view
    return URL


def getImages(url: str) -> list:
    if ADMIN_PARTY:
        response = requests.get(url)
    else:
        response = requests.get(url, auth=(DB_ADMIN_USER, DB_ADMIN_PASS))
    response = response.content.decode('utf-8')
    response = json.loads(response)
    # pdb.set_trace()
    images = {int(row['value']['_id']): row['value']['patient']
              for row in response['rows']}

    return images


def makeList(listName: str, images: list) -> None:
    uid = uuid.uuid1()
    t = datetime.now() - timedelta(hours=4)
    # Pair image ids by patient
    pairs = []
    patients = set(images.values())

    for patient in patients:
        pair = []
        for i, p in images.items():
            if p == patient:
                pair.append(i)
                if len(pair) == 2:
                    pairs.append(pair)
                    pair = []
    # pdb.set_trace()

    obj = {"type": "image_pair_list",
           "list_name": listName,
           "count": len(pairs),
           "list": pairs,
           "time_added": t.strftime('%Y-%m-%d %H:%M:%S')}
    db = couch[IMAGES_DB]
    print(f"Created Pair List: {listName}")
    doc_id, doc_rev = db.save(obj)


def main(imageSet: str, listName: str):
    url = getURL(imageSet)
    imageIDs = getImages(url)
    makeList(listName, imageIDs)


if __name__ == "__main__":
    try:
        main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet> or <listName>
        """)
