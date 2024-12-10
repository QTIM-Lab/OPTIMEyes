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
    couch = couchdb.Server(f'http://couchdb:{DB_PORT}')
    # couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(
        f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@couchdb:{DB_PORT}')
        # f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')

# couch package ex for later
    # db = couch[COUCH_DB]
    # imageIDs = [int(row['id']) for row in db.view('_design/basic_views/_view/imageSet2ImageId')]
    # imageIDs.sort()
    # imageIDs = [str(i) for i in imageIDs]


def getURL(imageSet: str) -> str:
    url = f"http://couchdb:{DB_PORT}/{COUCH_DB}"
    # url = f"http://{DNS}:{DB_PORT}/{COUCH_DB}"
    view = f'/_design/images/_view/imagesBySet?key="{imageSet}"'
    URL = url + view
    return URL


def getImageAttributes(url: str) -> list:
    if ADMIN_PARTY:
        response = requests.get(url)
    else:
        response = requests.get(url, auth=(COUCHDB_USER, COUCHDB_PASSWORD))
    response = response.content.decode('utf-8')
    response = json.loads(response)
    # try:
    #     response['rows'][0]['value']['order']
    #     data = {row['value']['order']:row['id'] for row in response['rows']}
    #     imageIDs = [data[i+1] for i in range(len(data.keys()))]
    #     print("try"); pdb.set_trace()
    # except KeyError:
    #     print("except"); pdb.set_trace()
    #     imageIDs = [row['id'] for row in response['rows']]
    #     imageIDs.sort()

    # return imageIDs
    # pdb.set_trace()
    rows = [row['value'] for row in response['rows']]
    rows_df = pd.DataFrame(rows)
    header = ['_id', 'group', 'image_type', 'start_x', 'end_x', 'start_y', 'end_y', 'order', 'image', 'type', 'imageSetName']
    return rows_df[header]

def checkIfListExists(monaiSegmentationOCTListName):
    db = couch[COUCH_DB]
    try:
        db[monaiSegmentationOCTListName]
        return True
    except couchdb.http.ResourceNotFound:
        print(f"Cannot find monaiSegmentationOCTListName: {monaiSegmentationOCTListName}")
        return False


#def makeMonaiSegmentationOCTList(monaiSegmentationOCTListName: str, images: list) -> None:
def makeMonaiSegmentationOCTList(imageSet: str, monaiSegmentationOCTListName: str, pctRepeat: int = 0) -> None:
    listExists = checkIfListExists(monaiSegmentationOCTListName)
    if not listExists:
        url = getURL(imageSet)
        ImageAttributes = getImageAttributes(url)
        OCTImageSetList = []
        for group in ImageAttributes['group'].unique():
            # pdb.set_trace()
            group_df = ImageAttributes[ImageAttributes['group'] == group]
            FAFImage = group_df[group_df['image_type'] == 'FAF']
            SLOImage = group_df[group_df['image_type'] == 'SLOImage']
            BScans = group_df[(group_df['image_type'] != 'FAF') & (group_df['image_type'] != 'SLOImage')]
            bscan_group = {}
            for i, row in BScans.iterrows():
                # pdb.set_trace()
                bscan = {
                    "image_id": row['_id'],
                    'start_x':row['start_x'],
                    'end_x':row['end_x'],
                    'start_y':row['start_y'],
                    'end_y':row['end_y'],
                }
                bscan_group[row['order']] = bscan
            OCTImageSet = {
                'group': group,
                'faf': {"image_id":FAFImage['_id'].values[0]},
                'slo': {"image_id":SLOImage['_id'].values[0]},
                'bscan_group': bscan_group,
            }
            OCTImageSetList.append(OCTImageSet)


        t = datetime.now() - timedelta(hours=4)
        obj = {
            "_id":monaiSegmentationOCTListName,
            "app": "monaiSegmentationOCT",
            "type": "imageList",
            "imageSet": imageSet, # probably redundant now
            "count": len(ImageAttributes['group'].unique()),
            "list": OCTImageSetList, #####################
            "time_added": t.strftime('%Y-%m-%d %H:%M:%S')}
        db = couch[COUCH_DB]
        print(f"Created Monai Segmentation List: {monaiSegmentationOCTListName}")

        doc_id, doc_rev = db.save(obj)


def main(imageSet: str, monaiSegmentationOCTListName: str, pctRepeat: int = 0):
    makeMonaiSegmentationOCTList(imageSet, monaiSegmentationOCTListName, pctRepeat)


if __name__ == "__main__":
    try:
        try:
            main(sys.argv[1], sys.argv[2], int(sys.argv[3]))
            print(
                f"* Creating Image Monai Segmentation OCT List using {sys.argv[3]}% repeats *")
        except IndexError as err:
            print(f"* Creating Image Monai Segmentation OCT List using 0% repeats *")
            main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet>, <monaiSegmentationOCTListName>, with optional [<pctRepeat>]
        """)
