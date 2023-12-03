import os
import sys
import requests
import json
import couchdb
import uuid
import random
import math
import pandas as pd
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from itertools import combinations


load_dotenv("flask_server/.env", verbose=True)

DB_ADMIN_USER = os.getenv("DB_ADMIN_USER")
DB_ADMIN_PASS = os.getenv("DB_ADMIN_PASS")
DNS = os.getenv("DNS")
IMAGES_DB = os.getenv("IMAGES_DB")
DB_PORT = os.getenv("DB_PORT")
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
    view = f'/_design/images/_view/imagesBySet?key="{imageSet}"'
    URL = url + view
    return URL


def getImageIDs(url: str) -> list:
    if ADMIN_PARTY:
        response = requests.get(url)
    else:
        response = requests.get(url, auth=(DB_ADMIN_USER, DB_ADMIN_PASS))
    response = response.content.decode('utf-8')
    response = json.loads(response)
    rows = []
    for row in response['rows']:
        row['value'].pop('_attachments')
        rows.append(row['value'])
    # imageIDs = [row['id'] for row in response['rows']]

    return rows


def checkIfListExists(flickerListName):
    db = couch[IMAGES_DB]
    try:
        db[flickerListName]
        return True
    except couchdb.http.ResourceNotFound:
        print(f"Cannot find flickerListName: {flickerListName}")
        return False


def makeFlickerList(imageSet: str, flickerListName: str, pctRepeat: int) -> None:
    listExists = checkIfListExists(flickerListName)
    if not listExists:
        url = getURL(imageSet)
        imageIDs = getImageIDs(url)
        imageIDs = pd.DataFrame(imageIDs)
        imageIDs = imageIDs.sort_values('index')
        group_size = 2
        pairs = list(zip(*(iter(imageIDs['_id']),) * group_size))
        pairs = [[i,j] for i,j in pairs]
        uid = uuid.uuid1()
        t = datetime.now() - timedelta(hours=4)
        obj = {
            "_id": flickerListName,
            "app": "flicker",
            "type": "imageList",
            "imageSet": imageSet,
            "count": len(pairs),
            "list": pairs,
            "time_added": t.strftime('%Y-%m-%d %H:%M:%S')}
        db = couch[IMAGES_DB]
        print(f"Created Flicker List: {flickerListName}")
        doc_id, doc_rev = db.save(obj)


def main(imageSet: str, flickerListName: str, pctRepeat: int = 0):
    makeFlickerList(imageSet, flickerListName, pctRepeat)


if __name__ == "__main__":
    try:
        try:
            main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
            print(
                f"* Creating Image Flicker List using {sys.argv[3]}% repeats *")
        except IndexError as err:
            print(f"* Creating Image Flicker List using 0% repeats *")
            main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet>, <flickerListName>, with optional [<pctRepeat>]
        """)
