import os
import sys
import requests
import json
import couchdb
import uuid
import pdb
import random
import math
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
    # pdb.set_trace()
    response = json.loads(response)
    try:
        response['rows'][0]['value']['order']
        data = {row['value']['order']:row['id'] for row in response['rows']}
        imageIDs = [data[i+1] for i in range(len(data.keys()))]
    except KeyError:
        imageIDs = [row['id'] for row in response['rows']]
        imageIDs.sort()

    return imageIDs

def checkIfListExists(monaiSegmentationListName):
    db = couch[IMAGES_DB]
    try:
        db[monaiSegmentationListName]
        return True
    except couchdb.http.ResourceNotFound:
        print(f"Cannot find monaiSegmentationListName: {monaiSegmentationListName}")
        return False


#def makeMonaiSegmentationList(monaiSegmentationListName: str, images: list) -> None:
def makeMonaiSegmentationList(imageSet: str, monaiSegmentationListName: str, pctRepeat: int = 0) -> None:
    listExists = checkIfListExists(monaiSegmentationListName)
    # pdb.set_trace()
    if not listExists:
        url = getURL(imageSet)
        # pdb.set_trace()
        imageIDs = getImageIDs(url)
        # create all unique combinations
        amountRepeat = math.ceil(pctRepeat/100 * len(imageIDs))
        # random.shuffle(imageIDs)
        # pdb.set_trace()
        repeats = random.sample(imageIDs, amountRepeat)
        images = imageIDs + repeats

        uid = uuid.uuid1()
        t = datetime.now() - timedelta(hours=4)
        obj = {
            "_id":monaiSegmentationListName,
            "app": "monaiSegmentation",
            "type": "imageList",
            "imageSet": imageSet, # probably redundant now
            "count": len(images),
            "list": images,
            "time_added": t.strftime('%Y-%m-%d %H:%M:%S')}
        db = couch[IMAGES_DB]
        print(f"Created Monai Segmentation List: {monaiSegmentationListName}")
        doc_id, doc_rev = db.save(obj)


def main(imageSet: str, monaiSegmentationListName: str, pctRepeat: int = 0):
    makeMonaiSegmentationList(imageSet, monaiSegmentationListName, pctRepeat)


if __name__ == "__main__":
    try:
        try:
            main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
            print(
                f"* Creating Image Monai Segmentation List using {sys.argv[3]}% repeats *")
        except IndexError as err:
            print(f"* Creating Image Monai Segmentation List using 0% repeats *")
            main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet>, <monaiSegmentationListName>, with optional [<pctRepeat>]
        """)
