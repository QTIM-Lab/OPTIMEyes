import os, sys, requests, json, couchdb, uuid, pdb, pprint as pp
from datetime import datetime, timezone, timedelta
# from dotenv import load_dotenv

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
    couch = couchdb.Server(f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@couchdb:{DB_PORT}')
    # couch = couchdb.Server(f'http://{COUCHDB_USER}:{COUCHDB_PASSWORD}@{DNS}:{DB_PORT}')

# couch package ex for later
# db = couch[COUCH_DB]
# imageIDs = [int(row['id']) for row in db.view('_design/basic_views/_view/imageSet2ImageId')]
# imageIDs.sort()
# imageIDs = [str(i) for i in imageIDs]

# def getURL(uuid: str) -> str:
#     url = f"http://{DNS}:{DB_PORT}/{COUCH_DB}"
#     view = f'/{uuid}'
#     URL = url + view
#     return URL

def checkIfListExists(taskName):
    db = couch[COUCH_DB]
    try:
        db[taskName]
        return True
    except couchdb.http.ResourceNotFound:
        print(f"Cannot find taskName: {taskName}")
        return False


def makeTask(user: str, imageListName: str, imageSet: str, imageListType: str, taskOrder: int, linkedWithImageListName: str = None) -> None:
    task_id = f"{user}-{imageListName}"
    listExists = checkIfListExists(task_id)
    #pdb.set_trace()
    if not listExists:
        t = datetime.now() - timedelta(hours=4)
        obj = {"_id":task_id,
            "type": "task",
            "app": imageListType,
            "list_name": f"{imageListName}",
            "imageSet": f"{imageSet}",
            "task_order": taskOrder,
            "user": user,
            "time_added": t.strftime('%Y-%m-%d %H:%M:%S'),
            "current_idx": 0,
            "completed": False,
            "tool_set": f"tool_set_{imageListType}_template",
        }
        if linkedWithImageListName is not None:
            obj['linked_with_image_list_name'] = linkedWithImageListName

        db = couch[COUCH_DB]
        doc_id, doc_rev = db.save(obj) # currently doc_id, doc_rev unused
        print(pp.pprint(f"created object {obj}"))
        return json.dumps("new_task_created")
    else:
        return json.dumps("task_already_exists")

def main(user: str, imageListName: str, imageSet: str, imageListType: str, taskOrder: int, linkedWithImageListName: str = "none"):
    # pdb.set_trace()
    makeTask(user, imageListName, imageSet, imageListType, taskOrder, linkedWithImageListName)

if __name__ == "__main__":
    try:
        try:
            print(f"* Creating Linked {sys.argv[3]} task linking {sys.argv[2]} with {sys.argv[5]} *")
            main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        except:
            print(f"* Creating {sys.argv[3]} task. *")
            main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    except IndexError as err:
        print(f"""
        Error: {err}, and probably means you 
        didn't provide <user>, <imageListName>, <imageListType>, <taskOrder>, with optional [<linkedWithImageListName>]
        """)
