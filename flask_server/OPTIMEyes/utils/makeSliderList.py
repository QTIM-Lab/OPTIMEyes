import os
import sys
import requests
import json
import couchdb
import uuid
import pdb
import random
import math
import pandas as pd
from datetime import datetime, timezone, timedelta
# from dotenv import load_dotenv
from itertools import combinations


# load_dotenv("flask_server/.env", verbose=True)

COUCHDB_USER = os.getenv("COUCHDB_USER")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD")
DNS = os.getenv("DNS")
COUCH_DB = os.getenv("COUCH_DB")
DB_PORT = os.getenv("DB_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False

# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')

# couch package ex for later
    # db = couch[COUCH_DB]
    # imageIDs = [int(row['id']) for row in db.view('_design/basic_views/_view/imageSet2ImageId')]
    # imageIDs.sort()
    # imageIDs = [str(i) for i in imageIDs]


def getURL(imageSet: str) -> str:
    url = f"http://{DNS}:{DB_PORT}/{COUCH_DB}"
    view = f'/_design/images/_view/imagesBySet?key="{imageSet}"'
    URL = url + view
    return URL


def getImageIDs(url: str) -> list:
    # pdb.set_trace()
    if ADMIN_PARTY:
        response = requests.get(url)
    else:
        response = requests.get(url, auth=(COUCHDB_USER, COUCHDB_PASSWORD))
    response = response.content.decode('utf-8')
    # pdb.set_trace()
    response = json.loads(response)
    rows = []
    for row in response['rows']:
        row['value'].pop('_attachments')
        rows.append(row['value'])
    # imageIDs = [row['id'] for row in response['rows']]

    return rows


def checkIfListExists(sliderListName):
    db = couch[COUCH_DB]
    pdb.set_trace()
    try:
        db[sliderListName]
        return True
    except couchdb.http.ResourceNotFound:
        print(f"Cannot find sliderListName: {sliderListName}")
        return False


def makeSliderList(imageSet: str, sliderListName: str, pctRepeat: int) -> None:
    listExists = checkIfListExists(sliderListName)
    # pdb.set_trace()
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
            "_id": sliderListName,
            "app": "slider",
            "type": "imageList",
            "imageSet": imageSet,
            "count": len(pairs),
            "list": pairs,
            "time_added": t.strftime('%Y-%m-%d %H:%M:%S')}
        db = couch[COUCH_DB]
        # pdb.set_trace()
        print(f"Created slider List: {sliderListName}")
        doc_id, doc_rev = db.save(obj)


def main(imageSet: str, sliderListName: str, pctRepeat: int = 0):
    # pdb.set_trace()
    makesliderList(imageSet, sliderListName, pctRepeat)


if __name__ == "__main__":
    try:
        try:
            main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
            print(
                f"* Creating Image Slider List using {sys.argv[3]}% repeats *")
        except IndexError as err:
            print(f"* Creating Image Slider List using 0% repeats *")
            main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet>, <sliderListName>, with optional [<pctRepeat>]
        """)
