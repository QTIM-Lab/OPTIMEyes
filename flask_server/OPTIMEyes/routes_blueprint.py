# import functools - https://flask.palletsprojects.com/en/2.0.x/tutorial/views/
import requests
import couchdb
import io
import json
import base64
import pdb
import zipfile

from flask import (
    current_app,
    Blueprint,
    flash,
    redirect,
    render_template,
    request,
    jsonify,
    send_file,
)

from flask_login import login_required, current_user

# self written utils
from .utils.makeTask import makeTask
from .utils.makeClassifyList import makeClassifyList
from .utils.makeCompareList import makeCompareList
from .utils.makeFlickerList import makeFlickerList
from .utils.makeSliderList import makeSliderList
from .utils.makeMonaiSegmentationList import makeMonaiSegmentationList
from .utils.addImages import addImages
from .utils.deleteImageSet import deleteImageSet

# DB
from OPTIMEyes.db import get_server

bp = Blueprint('routes_blueprint', __name__, url_prefix='/')

# please delete this when you can...it's so bad
def check_if_admin_party_then_make_request(url, method="GET", data="no data"):
    """
    Checks if we are in admin part and if so sends necessary credentials
    """
    if method == "GET":
        if current_app.config['ADMIN_PARTY']:
            response = requests.get('{}'.format(url))
        else:
            response = requests.get('{}'.format(
                url), auth=(current_app.config["COUCHDB_USER"], current_app.config["COUCHDB_PASSWORD"]))
    elif method == "PUT":
        if current_app.config['ADMIN_PARTY']:
            response = requests.put(url, data=data)
        else:
            response = requests.put(
                url, data=data, auth=(current_app.config["COUCHDB_USER"], current_app.config["COUCHDB_PASSWORD"]))
    elif method == "DELETE":
        if current_app.config['ADMIN_PARTY']:
            response = requests.delete(url)
        else:
            response = requests.delete(
                url, auth=(current_app.config["COUCHDB_USER"], current_app.config["COUCHDB_PASSWORD"]))
    return response


@bp.route('/configuration', methods=['GET'])
def config():
    
    """
    For the front end
    """
    try:
        USER_INFO = {"username":current_user.username, 
                     "logged_in":current_user.is_authenticated,
                     "admin":current_user.admin}
    except:
        USER_INFO = {"logged_in":current_user.is_authenticated}
    config = {
        "DNS": current_app.config['DNS'],
        "COUCH_DB": current_app.config['COUCH_DB'],
        "DB_PORT": current_app.config['DB_PORT'],
        "HTTP_PORT": current_app.config['HTTP_PORT'],
        "ADMIN_PARTY": current_app.config['ADMIN_PARTY'],
        "SSL": current_app.config['SSL'],
        "USER_INFO": USER_INFO
    }
    return jsonify(config)


# Navigation
@bp.route('/', methods=['GET'])
def vue_index():
    return render_template('/vuetify_components/index.html')

@bp.route('/main_dashboard', methods=['GET'])
@login_required
def main_dashboard():
    return render_template('/vuetify_components/main_dashboard.html')

@bp.route('/imagesDashboard', methods=['GET'])
@login_required
def imagesDashboard():
    # pdb.set_trace()
    return render_template('/vuetify_components/imagesDashboard.html')


@bp.route('/image_set_summary/<imageSet>', methods=['GET'])
@login_required
def image_set_summary(imageSet):
    return render_template('/vuetify_components/ImageSetSummary.html', imageSet=imageSet)

@bp.route('/tasksList', methods=['GET'])
@login_required
def tasksList():
    return render_template('/vuetify_components/tasksList.html')

## Apps
@bp.route('/classifyApp/<user>/<list_name>', methods=['GET'])
@login_required
def classifyApp(user, list_name):
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/classifyApp.html', task=task_dict)

@bp.route('/compareApp/<user>/<list_name>', methods=['GET'])
@login_required
def compareApp(user, list_name):
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/compareApp.html', task=task_dict)

@bp.route('/flickerApp/<user>/<list_name>', methods=['GET'])
@login_required
def flickerApp(user, list_name):
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/flickerApp.html', task=task_dict)

@bp.route('/sliderApp/<user>/<list_name>', methods=['GET'])
@login_required
def sliderApp(user, list_name):
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/sliderApp.html', task=task_dict)

@bp.route('/monaiSegmentationApp/<user>/<list_name>', methods=['GET'])
@login_required
def monaiSegmentationApp(user, list_name):
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/monaiSegmentationApp.html', task=task_dict)


@bp.route('/ohif', methods=['GET'])
@login_required
def ohif():
    return render_template('/vuetify_components/ohif.html')



# APIs
@bp.route('/add_images', methods=['POST'])
def add_images():
    print("in /add_images")
    folder=request.form['folder']
    imageSetName=request.form['imageSetName']
    imageSetTypeSelect=request.form['imageSetTypeSelect']
    addImages(folder, imageSetName, imageSetTypeSelect)
    return redirect('/imagesDashboard')
   
@bp.route('/delete_image_set/<imageSet>', methods=['DELETE'])
def delete_image_set(imageSet):
    print("in /delete_image_set")
    deleted_images = deleteImageSet(imageSet)
    return deleted_images
       
@bp.route('/make_task', methods=['POST'])
def make_task():
    #pdb.set_trace()
    print("in /make_task")
    new_task = json.loads(request.data)
    user=new_task['user']
    imageSetName=new_task['imageSetName'] # pre-existing; imageSet
    imageListTypeSelect=new_task['imageListTypeSelect']
    pctRepeat = 0
    taskOrder=new_task['taskOrder']
    # pdb.set_trace()
    #pdb.set_trace()
    if imageListTypeSelect == "classify":
        listName=f"{imageSetName}-{imageListTypeSelect}-{pctRepeat}" # Placeholder and won't allow duplicates; add form entry to truly customze and add duplicates
        makeClassifyList(imageSet=imageSetName, classifyListName=listName, pctRepeat=pctRepeat)
    elif imageListTypeSelect == "compare":
        listName=f"{imageSetName}-{imageListTypeSelect}-{pctRepeat}" # Placeholder and won't allow duplicates; add form entry to truly customze and add duplicates
        makeCompareList(imageSet=imageSetName, compareListName=listName, pctRepeat=pctRepeat)
    elif imageListTypeSelect == "flicker":
        listName=f"{imageSetName}-{imageListTypeSelect}-{pctRepeat}" # Placeholder and won't allow duplicates; add form entry to truly customze and add duplicates
        makeFlickerList(imageSet=imageSetName, flickerListName=listName, pctRepeat=pctRepeat)
    elif imageListTypeSelect == "slider":
        listName=f"{imageSetName}-{imageListTypeSelect}-{pctRepeat}" # Placeholder and won't allow duplicates; add form entry to truly customze and add duplicates
        makeSliderList(imageSet=imageSetName, sliderListName=listName, pctRepeat=pctRepeat)
    elif imageListTypeSelect == "monaiSegmentation":
        listName=f"{imageSetName}-{imageListTypeSelect}-{pctRepeat}" # Placeholder and won't allow duplicates; add form entry to truly customze and add duplicates
        makeMonaiSegmentationList(imageSet=imageSetName, monaiSegmentationListName=listName, pctRepeat=pctRepeat)
    elif imageListTypeSelect == "grid":
        pass
    elif imageListTypeSelect == "pair":
        pass
    makeTaskMessage = makeTask(user=user, imageListName=listName, imageSet=imageSetName, imageListType=imageListTypeSelect, taskOrder=taskOrder)
    return json.dumps(makeTaskMessage)
    
@bp.route('/get_image_sets', methods=['GET'])
def get_image_sets():
    print("in /get_image_sets")
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    view = f"_design/images/_view/images?group_level=1"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_images_by_set/<imageSet>', methods=['GET'])
def get_images_by_set(imageSet):
    """_summary_

    Args:
        imageSet (_type_): image set or raw images set name

    Returns:
        _type_: set of image ids from the database
    """
    print("in /get_images_by_set")
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    view = f'_design/images/_view/imagesBySet?key="{imageSet}"'
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_tasks/<app>', methods=['GET'])
def get_tasks(app):
    username = request.args['username']
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
    view = f"_design/{app}App/_view/tasksByUser?key=\"{username}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_task/<app>/<user>/<list_name>', methods=['GET'])
def get_task(app, user, list_name):
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
    view = f"_design/{app}App/_view/tasksByUserAndListName?key=[\"{user}\", \"{list_name}\"]"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

# Marked for deletion...thing is it's a good guide to writing this.
@bp.route('/reset_to_previous_result/<app>', methods=['POST'])
def reset_to_previous_result(app):
    currentTask = json.loads(request.data)
    # currentTask['value']['current_idx']
    # currentTask[image_list']
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    last_result_key=currentTask['last_result_key']
    view = f'_design/{app}App/_view/results?key=%22{last_result_key}%22'
    url = f'{base}/{view}'
    print(url)
    response = check_if_admin_party_then_make_request(url)
    all_results = json.loads(response.content.decode('utf-8'))
    row = all_results['rows'][0]
    if len(all_results['rows']) > 1:
        print("We have a problem! len(all_results['rows']) > 1 ")
        pdb.set_trace()
    else:
        old_result_id, old_result_rev = row['value']['_id'], row['value']['_rev']

    if len(old_result_id) == 0 or len(old_result_rev) == 0:
        pdb.set_trace()  # quick error handling till I properly implement

    # delete old result
    view = f"{old_result_id}?rev={old_result_rev}"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url, method="DELETE")
    delete_response_content = json.loads(response.content.decode('utf-8'))

    # adjust task idx
    view = f"{currentTask['value']['_id']}?rev={currentTask['value']['_rev']}"
    url = f"{base}/{view}"
    if currentTask['value']['current_idx'] != 0 and not currentTask['value']['current_idx'] < 0:
        currentTask['value']['current_idx'] -= 1
    response = check_if_admin_party_then_make_request(url, method="PUT", data=json.dumps(currentTask['value']))
    adjust_task_idx_response_content = json.loads(response.content.decode('utf-8'))

    return jsonify({'deleted_result_id': old_result_id, 'previous_result_rev': old_result_rev})

# Marked for deletion...maybe needs to be used when making update functionality
@bp.route('/update_tasks/<task_id>', methods=['PUT'])
def update_tasks(task_id):
    base = "http://{}:{}/{}".format(
        DNS, current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    url = f"{base}/{task_id}"
    results = json.loads(request.data)
    response = check_if_admin_party_then_make_request(
        url, method="PUT", data=json.dumps(results))
    return response.content


@bp.route('/get_toolset/<app>/<tool_set>', methods=['GET'])
def get_toolset(app,tool_set):
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["COUCH_DB"])
    view = f"_design/{app}App/_view/toolSets?key=\"{tool_set}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))



@bp.route('/get_image_classify_lists', methods=['GET'])
def get_image_classify_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    try:
        key = request.args['key']
    except:
        # view = f"_design/basic_views/_view/image_classify_lists"
        view = f"_design/classifyApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # view = f"_design/basic_views/_view/image_classify_lists?key=\"{key}\""
    view = f"_design/classifyApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_compare_lists', methods=['GET'])
def get_image_compare_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    try:
        key = request.args['key']
    except:
        # view = f"_design/basic_views/_view/image_compare_lists"
        view = f"_design/compareApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    print("past except")
    # view = f"_design/basic_views/_view/image_compare_lists?key=\"{key}\""
    view = f"_design/compareApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_flicker_lists', methods=['GET'])
def get_image_flicker_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    try:
        key = request.args['key']
    except:
        # view = f"_design/basic_views/_view/image_flicker_lists"
        view = f"_design/flickerApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # view = f"_design/basic_views/_view/image_flicker_lists?key=\"{key}\""
    view = f"_design/flickerApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_image_slider_lists', methods=['GET'])
def get_image_slider_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    try:
        key = request.args['key']
    except:
        # view = f"_design/basic_views/_view/image_slider_lists"
        view = f"_design/sliderApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # view = f"_design/basic_views/_view/image_slider_lists?key=\"{key}\""
    view = f"_design/sliderApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_image_monai_segmentation_lists', methods=['GET'])
def get_image_monai_segmentation_lists():
    base = "http://{}:{}/{}".format(
        "couchdb", current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
        # current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["COUCH_DB"])
    try:
        key = request.args['key']
    except:
        view = f"_design/monaiSegmentationApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    view = f"_design/monaiSegmentationApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))



@bp.route('/get_image/<image_id>', methods=['GET'])
def get_image(image_id):
    # Get Image ID to fetch image data
    IMAGE_ID = image_id
    url_for_couchdb_image_fetch = f'http://couchdb:{current_app.config["DB_PORT"]}/{current_app.config["COUCH_DB"]}/{IMAGE_ID}/image'
    # url_for_couchdb_image_fetch = f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}/{current_app.config["COUCH_DB"]}/{IMAGE_ID}/image'
    response = check_if_admin_party_then_make_request(url_for_couchdb_image_fetch)
    response.raw.decode_content = True # You can inspect with: type(response.content) # bytes
    image_response = base64.b64encode(response.content)
    # Fetch image name
    url_for_couchdb_image_name_fetch = f'http://couchdb:{current_app.config["DB_PORT"]}/{current_app.config["COUCH_DB"]}/{IMAGE_ID}/'
    # url_for_couchdb_image_name_fetch = f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}/{current_app.config["COUCH_DB"]}/{IMAGE_ID}/'
    response = check_if_admin_party_then_make_request(url_for_couchdb_image_name_fetch)
    image_meta_data = json.loads(response.content)
    # pdb.set_trace()
    try:
        attachment_filename = image_meta_data['image'] # was this before...keeping in case others have this pattern
    except:
        attachment_filename = image_meta_data['origin']
    attachment_extension = attachment_filename[-3:]
    response = send_file(
        path_or_file=io.BytesIO(image_response),
        mimetype=f'image/{attachment_extension}',
        as_attachment=True,
        download_name=attachment_filename)
    return response

@bp.route('/task_result', methods=['POST'])
def task_result():
    print("in /task_result")
    couch_server = get_server(); db = couch_server['image_comparator'];
    if current_app.config["ADMIN_PARTY"]:
        couch = couchdb.Server(
            f'http://couchdb:{current_app.config["DB_PORT"]}')
            # f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}')
    else:
        couch = couchdb.Server(
            f'http://{current_app.config["COUCHDB_USER"]}:{current_app.config["COUCHDB_PASSWORD"]}@couchdb:{current_app.config["DB_PORT"]}')
            # f'http://{current_app.config["COUCHDB_USER"]}:{current_app.config["COUCHDB_PASSWORD"]}@{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}')
    # pdb.set_trace()
    db = couch[current_app.config["COUCH_DB"]]
    # Determine which app
    app = None # Redundant...clean up
    if isinstance(request.data, bytes) and request.data != b'': # broken!
        results = json.loads(request.data)
        app = results['app']
        # 1 save results to db
        doc_id, doc_rev = db.save(results)
        doc = db.get(doc_id)  # the doc we saved if we need it
    else:
        results = json.loads(request.form.get('json'))
        app = results['app']
    # Determine task type
    if results['app'] == "monaiSegmentation":
        # Get the image blob data
        image_blob = request.files.get('image') 
        # Save doc
        doc_id, doc_rev = db.save(results)
        # Attach the image to the document
        # pdb.set_trace()
        image_extension = doc_id.split(".")[-1]
        db.put_attachment(db[doc_id], image_blob.read(), f'image.{image_extension}', content_type=f'image/{image_extension}')
        # pdb.set_trace()
        # 2 needs to mark flicker task being referenced as "completed" if this was the last task
        #   or we need to increment the current_idx on the task
        # Get Task
        task_map = db.find({'selector': {
            "_id": results['taskid'],
            'list_name': results['list_name'],
            'app': results['app'],
            'type': 'task',
            'user': results['user']}})
        # Get Monail Segmentation List
        list_map = db.find(
            {'selector': {
                "_id": results['list_name'],
                "type": "imageList"}
            })
        task = task_map.__next__()
        image_list = list_map.__next__()
        # pdb.set_trace()
        if task['current_idx'] == image_list['count'] - 1:
            # That was the last task so mark task as complete
            task['completed'] = True
            db[task['_id']] = task
        else:
            task['current_idx'] += 1
            db[task['_id']] = task
        return jsonify('asdf')  # ! What is this
        # Now you have saved the JSON document with the image attachment
        return jsonify({"message": "Upload successful"})      
    elif results['app'] == "grid": # I've modified without back testing
        # 2 needs to mark grid task being referenced as "completed"
        x = db.find({'selector': {
            'list_name': results['task_list_name'],
            'type': 'task'}})
        _id = x.__next__()['_id']
        grid_list = db[_id]
        grid_list['completed'] = True
        db[_id] = grid_list
    elif results['app'] == "classify": # I've modified without back testing
        # 2 needs to mark compare task being referenced as "completed" if this was the last task
        #   or we need to increment the current_idx on the task
        # Get Task
        task_map = db.find({'selector': {
            "_id": results['taskid'],
            'list_name': results['list_name'],
            'app': results['app'],
            'type': 'task',
            'user': results['user']}})
        
        # Get Classify List
        classify_list_map = db.find(
            {'selector': {
                "_id": results['list_name'],
                "type": "imageList"}
            })
        task = task_map.__next__()
        classify_list = classify_list_map.__next__()
        if task['current_idx'] == classify_list['count'] - 1:
            # That was the last task so mark task as complete
            task['completed'] = True
            db[task['_id']] = task
        else:
            task['current_idx'] += 1
            db[task['_id']] = task

        return jsonify('success')  # ! What is this
    elif results['app'] == "compare": # I've modified without back testing
        # 2 needs to mark compare task being referenced as "completed" if this was the last task
        #   or we need to increment the current_idx on the task
        # Get Task
        task_map = db.find({'selector': {
            "_id": results['taskid'],
            'list_name': results['list_name'],
            'app': results['app'],
            'type': 'task',
            'user': results['user']}})
        # Get Compare List
        compare_list_map = db.find(
            {'selector': {
                "_id": results['list_name'],
                "type": "imageList"}
            })
        task = task_map.__next__()
        compare_list = compare_list_map.__next__()
        if task['current_idx'] == compare_list['count'] - 1:
            # That was the last task so mark task as complete
            task['completed'] = True
            db[task['_id']] = task
        else:
            task['current_idx'] += 1
            db[task['_id']] = task
        return jsonify('asdf')  # ! What is this
    elif results['app'] == "flicker": # I've modified without back testing
        # 2 needs to mark flicker task being referenced as "completed" if this was the last task
        #   or we need to increment the current_idx on the task
        # Get Task
        task_map = db.find({'selector': {
            "_id": results['taskid'],
            'list_name': results['list_name'],
            'app': results['app'],
            'type': 'task',
            'user': results['user']}})
        # Get Flicker List
        flicker_list_map = db.find(
            {'selector': {
                "_id": results['list_name'],
                "type": "imageList"}
            })
        task = task_map.__next__()
        flicker_list = flicker_list_map.__next__()
        if task['current_idx'] == flicker_list['count'] - 1:
            # That was the last task so mark task as complete
            task['completed'] = True
            db[task['_id']] = task
        else:
            task['current_idx'] += 1
            db[task['_id']] = task
        return jsonify('asdf')  # ! What is this
    elif results['app'] == "pair": # I've modified without back testing
        # 2 needs to mark compare task being referenced as "completed" if this was the last task
        #   or we need to increment the current_idx on the task
        task_list_name = results['task_list_name']
        # Get Task
        task_map = db.find({'selector': {
                           "_id": results['task'],
                           'list_name': task_list_name,
                           'type': 'task',
                           'user': results['user']}})
        # Get Pair List
        pair_list_map = db.find(
            {'selector': {"list_name": task_list_name,
                          "type": "image_pair_list"}})
        task = task_map.__next__()
        pair_list = pair_list_map.__next__()
        if task['current_idx'] == pair_list['count'] - 1:
            # That was the last task so mark task as complete
            task['completed'] = True
            db[task['_id']] = task
        else:
            task['current_idx'] += 1
            db[task['_id']] = task

        return jsonify('asdf')  # ! What is this

    return jsonify('asdf')  # ! What is this

@bp.route('/downloadAnnotations/<app>/<task_id>', methods=['GET'])
def downloadAnnotations(app, task_id, cli=False, zip_path=None):
    couch_server = get_server(); db = couch_server['image_comparator'];
    view = f'_design/{app}App/_view/resultsByTask?key=%22{task_id}%22'
    # Fetch annotations from CouchDB
    annotations = db.view('monaiSegmentationApp/resultsByTask', key=task_id)
    # Fetch images from CouchDB
    task = db.view('monaiSegmentationApp/tasks', key=task_id)
    # print(task)
    # [i for i in annotations]
    # [i for i in task]
    # for row in task.rows:##########        # Access the document ID of each row using the `id` attribute
    #     doc_id = row.id
    #     print(f"Document ID: {doc_id}")
    task_rows = [record for record in task.rows]
    if len(task_rows) != 1:
        raise Exception("Multiple tasks returned for task_id.")
    task_value = task_rows[0].value
    images = db.view('images/imagesBySet', key=task_value['imageSet'])
    # Create an in-memory zip file
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
        for record in annotations:
            # Assuming the attachment name is 'image' and you want to use the record ID as the filename
            if record.id.find('.png') != -1:
                attachment = db.get_attachment(record.id, 'image.png')
            elif record.id.find('.jpg') != -1:
                attachment = db.get_attachment(record.id, 'image.jpg')
            if attachment:
                zip_file.writestr(f"{record.id}", attachment.read())
        for image in images:
            # Assuming the attachment name is 'image' and you want to use the image ID as the filename
            if image.id.find('.png') != -1:
                attachment = db.get_attachment(image.id, 'image')
            elif image.id.find('.jpg') != -1:
                attachment = db.get_attachment(image.id, 'image')
            if attachment:
                zip_file.writestr(f"{image.id}", attachment.read())
                

    # Move to the beginning of the buffer:
    # Seeking to the beginning of the file (zip_buffer.seek(0)) is necessary because after writing data to the zip file, the file pointer moves to the end of the file.
    # When you return the file using send_file, Flask reads from the current position of the file pointer. If you don't seek back to the beginning, Flask will read from the end of the file, resulting in an empty or partially empty response because the file pointer is at the end.
    zip_buffer.seek(0)
    # zip_buffer.getbuffer().nbytes
    # Return the zip file as a downloadable attachment
    if cli:
        with open(zip_path, 'wb') as zfile:
            # pdb.set_trace()
            zfile.write(zip_buffer.getvalue())
    else:
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='annotations_and_source_images.zip'
        )