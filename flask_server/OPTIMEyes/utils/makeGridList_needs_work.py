# require 'net/http'
# require 'uri'
# require 'json'

import os, sys, requests, json, couchdb, uuid, pdb
from datetime import datetime, timezone, timedelta
# from dotenv import load_dotenv



# load_dotenv("flask_server/.env",verbose=True)
 
COUCHDB_USER = os.getenv("COUCHDB_USER")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD")
DNS = os.getenv("DNS")
COUCH_DB = os.getenv("COUCH_DB")
DB_PORT = os.getenv("DB_PORT")
HTTP_PORT = os.getenv("HTTP_PORT")
ADMIN_PARTY = True if os.getenv("ADMIN_PARTY") == 'True' else False

# https://couchdb-python.readthedocs.io/en/latest/getting-started.html
if ADMIN_PARTY:
    couch = couchdb.Server(f'http://{DNS}:{DB_PORT}')
else:
    couch = couchdb.Server(f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')

# couch package ex for later
    # db = couch[COUCH_DB]
    # imageIDs = [int(row['id']) for row in db.view('_design/basic_views/_view/imageSet2ImageId')]
    # imageIDs.sort()
    # imageIDs = [str(i) for i in imageIDs]

def getURL(imageSet: str) -> str:
    url = f"http://{DNS}:{DB_PORT}/{COUCH_DB}"
    view = f'/_design/basic_views/_view/imageSet2ImageId?key="{imageSet}"'
    URL = url + view
    return URL

def getImageIDs(url: str) -> list:
    # pdb.set_trace()
    if ADMIN_PARTY:
        response = requests.get(url)
    else:
        response = requests.get(url, auth=(COUCHDB_USER, COUCHDB_PASSWORD))
    response = response.content.decode('utf-8')
    response = json.loads(response)    
    imageIDs = [int(row['id']) for row in response['rows']]
    imageIDs.sort()

    return imageIDs

def makeList(listName: str, imageIDs: list) -> None:
    uid = uuid.uuid1()
    t = datetime.now() - timedelta(hours=4)
    obj = {"type":"image_grid_list",
           "list_name": listName,
           "unique_image_count":len(imageIDs),
           "count":len(imageIDs), # If we add pctRepeat in this could be larger
           "list":imageIDs,
           "time_added":t.strftime('%Y-%m-%d %H:%M:%S')}
    db = couch[COUCH_DB]
    # pdb.set_trace()
    print(f"Created Grid List: {listName}")
    doc_id, doc_rev = db.save(obj)
    


def main(imageSet: str, listName: str):
    url = getURL(imageSet)
    imageIDs = getImageIDs(url)
    makeList(listName, imageIDs)



if __name__ == "__main__":
    try:
        main(sys.argv[1], sys.argv[2])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <imageSet> or <listName>
        """)
    


