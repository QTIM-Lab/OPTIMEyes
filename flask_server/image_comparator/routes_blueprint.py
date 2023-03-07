# import functools - https://flask.palletsprojects.com/en/2.0.x/tutorial/views/
import requests
import couchdb
import io
import json
import base64
import pdb

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
from .utils.addImages import addImages
from .utils.deleteImageSet import deleteImageSet

# DB
from image_comparator.db import get_server

bp = Blueprint('routes_blueprint', __name__, url_prefix='/')

# a simple page that says hello
@bp.route('/hello')
@login_required
def hello():
    print(app)
    print(current_app.config["DNS"])
    print(current_app.config["DB_PORT"])
    print(current_app.config["IMAGES_DB"])
    print(current_app.config["DB_ADMIN_USER"])
    print(current_app.config["DB_ADMIN_PASS"])
    print(current_app.config["ADMIN_PARTY"])
    return 'Hello, World!'


def check_if_admin_party_then_make_request(url, method="GET", data="no data"):
    """
    Checks if we are in admin part and if so sends necessary credentials
    """
    if method == "GET":
        # pdb.set_trace()
        if current_app.config['ADMIN_PARTY']:
            response = requests.get('{}'.format(url))
        else:
            response = requests.get('{}'.format(
                url), auth=(current_app.config["DB_ADMIN_USER"], current_app.config["DB_ADMIN_PASS"]))
    elif method == "PUT":
        # pdb.set_trace()
        if current_app.config['ADMIN_PARTY']:
            response = requests.put(url, data=data)
        else:
            response = requests.put(
                url, data=data, auth=(current_app.config["DB_ADMIN_USER"], current_app.config["DB_ADMIN_PASS"]))
    elif method == "DELETE":
        # pdb.set_trace()
        if current_app.config['ADMIN_PARTY']:
            response = requests.delete(url)
        else:
            response = requests.delete(
                url, auth=(current_app.config["DB_ADMIN_USER"], current_app.config["DB_ADMIN_PASS"]))
    return response


@bp.route('/configuration', methods=['GET'])
def config():
    # pdb.set_trace()
    
    """
    For the front end
    """
    try:
        USER_INFO = {"username":current_user.username, 
                     "logged_in":current_user.is_authenticated,
                     "admin":current_user.admin}
    except:
        USER_INFO = {"logged_in":current_user.is_authenticated}
    # pdb.set_trace()
    config = {
        "DNS": current_app.config['DNS'],
        "IMAGES_DB": current_app.config['IMAGES_DB'],
        "DB_PORT": current_app.config['DB_PORT'],
        "HTTP_PORT": current_app.config['HTTP_PORT'],
        "ADMIN_PARTY": current_app.config['ADMIN_PARTY'],
        "USER_INFO": USER_INFO
    }
    return jsonify(config)

# Apps

# old and delete soon
# @bp.route('/', methods=['GET'])
# def index():
#     return render_template('index.html')

# @bp.route('/app_list', methods=['GET'])
# @login_required
# def app_list():
#     #return render_template('app_list.html')
#     return render_template('/vuetify_components/app_list.html')


@bp.route('/', methods=['GET'])
def vue_index():
    return render_template('/vuetify_components/index.html')


@bp.route('/main_dashboard', methods=['GET'])
@login_required
def main_dashboard():
    return render_template('/vuetify_components/main_dashboard.html')


@bp.route('/tasksList', methods=['GET'])
@login_required
def tasksList():
    return render_template('/vuetify_components/tasksList.html')

@bp.route('/classifyApp/<user>/<list_name>', methods=['GET'])
def classifyApp(user, list_name):
    # pdb.set_trace()
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/classifyApp.html', task=task_dict)


@bp.route('/compareApp/<user>/<list_name>', methods=['GET'])
def compareApp(user, list_name):
    # pdb.set_trace()
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/compareApp.html', task=task_dict)


@bp.route('/flickerApp/<user>/<list_name>', methods=['GET'])
def flickerApp(user, list_name):
    # pdb.set_trace()
    task_dict = {"user":user, "list_name":list_name}
    return render_template('/vuetify_components/flickerApp.html', task=task_dict)


@bp.route('/ohif', methods=['GET'])
@login_required
def ohif():
    return render_template('/vuetify_components/ohif.html')


@bp.route('/imagesDashboard', methods=['GET'])
@login_required
def imagesDashboard():
    return render_template('/vuetify_components/imagesDashboard.html')

@bp.route('/image_set_summary/<imageSet>', methods=['GET'])
@login_required
def image_set_summary(imageSet):
    return render_template('/vuetify_components/ImageSetSummary.html', imageSet=imageSet)
    




# OLD apps
@bp.route('/two_image', methods=['GET'])
def two_image():
    con = json.loads(config().data)
    con['app'] = 'Compare'
    return render_template('two_image.html', app_config=con)


@bp.route('/image_class', methods=['GET'])
def image_class():
    con = json.loads(config().data)
    con['app'] = 'Classify'
    return render_template('image_class.html', app_config=con)


@bp.route('/grid_class', methods=['GET'])
def grid_class():
    con = json.loads(config().data)
    con['app'] = 'Grid'
    return render_template('grid_class.html', app_config=con)

@bp.route('/grid_class_dev', methods=['GET'])
def grid_class_dev():
    con = json.loads(config().data)
    con['app'] = 'Grid'
    return render_template('grid_class_dev.html', app_config=con)

@bp.route('/pair_image', methods=['GET'])
def pair_image():
    con = json.loads(config().data)
    con['app'] = 'Pair'
    return render_template('pair_image.html', app_config=con)

# @bp.route('/image_order', methods=['GET'])
# def image_order():
#     return render_template('image_order.html')

# Pages


@bp.route('/about', methods=['GET'])
def about():
    return render_template('about.html')


@bp.route('/contact', methods=['GET'])
def contact():
    return render_template('contact.html')


# Action APIs
@bp.route('/add_images', methods=['POST'])
def add_images():
    print("in /add_images")
    # pdb.set_trace()
    folder=request.form['folder']
    imageSetName=request.form['imageSetName']
    imageSetTypeSelect=request.form['imageSetTypeSelect']
    addImages(folder, imageSetName, imageSetTypeSelect)
    return redirect('/imagesDashboard')
   
@bp.route('/delete_image_set/<imageSet>', methods=['DELETE'])
def delete_image_set(imageSet):
    print("in /delete_image_set")
    deleted_images = deleteImageSet(imageSet)
    # pdb.set_trace()
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
    elif imageListTypeSelect == "grid":
        pass
    elif imageListTypeSelect == "pair":
        pass
    makeTaskMessage = makeTask(user=user, imageListName=listName, imageSet=imageSetName, imageListType=imageListTypeSelect, taskOrder=taskOrder)
    return json.dumps(makeTaskMessage)
    

@bp.route('/get_users', methods=['GET'])
def get_users():
    print("in /get_users")
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    view = f"_design/basic_views/_view/users"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_sets', methods=['GET'])
def get_image_sets():
    print("in /get_image_sets")
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
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
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    view = f'_design/images/_view/imagesBySet?key="{imageSet}"'
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_tasks/<app>', methods=['GET'])
def get_tasks(app):
    username = request.args['username']
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["IMAGES_DB"])
    # view = f"_design/basic_views/_view/incomplete_{app}_tasks?key=\"{username}\""
    # view = f"_design/{app}App/_view/incomplete_{app}_tasks?key=\"{username}\""
    view = f"_design/{app}App/_view/tasks?key=\"{username}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_task/<app>/<user>/<list_name>', methods=['GET'])
def get_task(app, user, list_name):
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["IMAGES_DB"])
    view = f"_design/{app}App/_view/tasksByUserAndListName?key=[\"{user}\", \"{list_name}\"]"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()
    return json.loads(response.content.decode('utf-8'))

@bp.route('/get_toolset/<app>/<tool_set>', methods=['GET'])
def get_toolset(app,tool_set):
    # pdb.set_trace()
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config['DB_PORT'], current_app.config["IMAGES_DB"])
    view = f"_design/{app}App/_view/toolSets?key=\"{tool_set}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_compare_lists', methods=['GET'])
def get_image_compare_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    try:
        key = request.args['key']
    except:
        print("in except")
        # pdb.set_trace()
        # view = f"_design/basic_views/_view/image_compare_lists"
        view = f"_design/compareApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # pdb.set_trace()
    print("past except")
    # view = f"_design/basic_views/_view/image_compare_lists?key=\"{key}\""
    view = f"_design/compareApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_classify_lists', methods=['GET'])
def get_image_classify_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    try:
        key = request.args['key']
    except:
        print("in except")
        # pdb.set_trace()
        # view = f"_design/basic_views/_view/image_classify_lists"
        view = f"_design/classifyApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # pdb.set_trace()
    # view = f"_design/basic_views/_view/image_classify_lists?key=\"{key}\""
    view = f"_design/classifyApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_flicker_lists', methods=['GET'])
def get_image_flicker_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    try:
        key = request.args['key']
    except:
        print("in except")
        # pdb.set_trace()
        # view = f"_design/basic_views/_view/image_flicker_lists"
        view = f"_design/flickerApp/_view/imageLists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    # pdb.set_trace()
    # view = f"_design/basic_views/_view/image_flicker_lists?key=\"{key}\""
    view = f"_design/flickerApp/_view/imageLists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()
    return json.loads(response.content.decode('utf-8'))




@bp.route('/get_image_grid_lists', methods=['GET'])
def get_image_grid_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    try:
        key = request.args['key']
    except:
        print("in except")
        # pdb.set_trace()
        view = f"_design/basic_views/_view/image_grid_lists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    print("past except")
    view = f"_design/basic_views/_view/image_grid_lists?key=\"{key}\""
    url = f"{base}/{view}"
    # pdb.set_trace()
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_image_pair_lists', methods=['GET'])
def get_image_pair_lists():
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    # pdb.set_trace()
    try:
        key = request.args['key']
    except:
        print("in except")
        # pdb.set_trace()
        view = f"_design/basic_views/_view/image_pair_lists"
        url = f"{base}/{view}"
        response = check_if_admin_party_then_make_request(url)
        return json.loads(response.content.decode('utf-8'))
    print("past except")
    view = f"_design/basic_views/_view/image_pair_lists?key=\"{key}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/icl_lengths', methods=['GET'])
def icl_lengths():
    print("in /icl_lengths")
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    icl_id = request.args['key']
    view = f"_design/basic_views/_view/icl_lengths?key=\"{icl_id}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    return json.loads(response.content.decode('utf-8'))


@bp.route('/update_tasks/<task_id>', methods=['PUT'])
def update_tasks(task_id):
    base = "http://{}:{}/{}".format(
        DNS, current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    url = f"{base}/{task_id}"
    results = json.loads(request.data)
    response = check_if_admin_party_then_make_request(
        url, method="PUT", data=json.dumps(results))
    return response.content


@bp.route('/get_image/<image_id>', methods=['GET'])
def get_image(image_id):
    # Get Image ID to fetch image data
    IMAGE_ID = image_id
    url_for_couchdb_image_fetch = f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}/{current_app.config["IMAGES_DB"]}/{IMAGE_ID}/image'
    response = check_if_admin_party_then_make_request(url_for_couchdb_image_fetch)
    response.raw.decode_content = True # You can inspect with: type(response.content) # bytes
    image_response = base64.b64encode(response.content)
    # Fetch image name
    url_for_couchdb_image_name_fetch = f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}/{current_app.config["IMAGES_DB"]}/{IMAGE_ID}/'
    # pdb.set_trace()
    response = check_if_admin_party_then_make_request(url_for_couchdb_image_name_fetch)
    image_meta_data = json.loads(response.content)
    #pdb.set_trace()
    attachment_filename = image_meta_data['origin']
    attachment_extension = attachment_filename[-3:]
    response = send_file(
        path_or_file=io.BytesIO(image_response),
        mimetype=f'image/{attachment_extension}',
        as_attachment=True,
        download_name=attachment_filename)
    return response

# OLD
# @bp.route('/task_results', methods=['POST'])

@bp.route('/task_result', methods=['POST'])
def task_result():
    print("in /task_result")
    couch_server = get_server(); db = couch_server['image_comparator'];
    if current_app.config["ADMIN_PARTY"]:
        couch = couchdb.Server(
            f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}')
    else:
        # pdb.set_trace()
        couch = couchdb.Server(
            f'http://{current_app.config["DB_ADMIN_USER"]}:{current_app.config["DB_ADMIN_PASS"]}@{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}')
    db = couch[current_app.config["IMAGES_DB"]]
    results = json.loads(request.data)
    # 1 save results to db
    doc_id, doc_rev = db.save(results)
    doc = db.get(doc_id)  # the doc we saved if we need it

    # Determine task type
    if results['app'] == "grid": # I've modified without back testing
        # pdb.set_trace()
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
        # pdb.set_trace()
        if task['current_idx'] == classify_list['count'] - 1:
            # That was the last task so mark task as complete
            # pdb.set_trace()
            task['completed'] = True
            db[task['_id']] = task
        else:
            # pdb.set_trace()
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
        # pdb.set_trace()
        if task['current_idx'] == compare_list['count'] - 1:
            # That was the last task so mark task as complete
            # pdb.set_trace()
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
        # pdb.set_trace()
        if task['current_idx'] == flicker_list['count'] - 1:
            # That was the last task so mark task as complete
            # pdb.set_trace()
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
            # pdb.set_trace()
            task['completed'] = True
            db[task['_id']] = task
        else:
            # pdb.set_trace()
            task['current_idx'] += 1
            db[task['_id']] = task

        return jsonify('asdf')  # ! What is this

    return jsonify('asdf')  # ! What is this


@bp.route('/create_user', methods=['POST'])
def create_user():
    print("in /create_user")
    couch = couchdb.Server(
        f'http://{current_app.config["DNS"]}:{current_app.config["DB_PORT"]}')
    db = couch[current_app.config["IMAGES_DB"]]
    con = json.loads(config().data)
    # Check Form
    if request.form['username'] == '':
        flash("You can't leave user field blank")
        return render_template('two_image.html', app_config=con)
    elif request.form['username'].find(";") != -1:
        flash("Username cannot have \";\"'s")
        return render_template('two_image.html', app_config=con)
    else:
        username = request.form['username']

    try:
        years_exp = request.form['years-exp']
    except:
        flash("You have to choose your years of experience")
        return render_template('two_image.html', app_config=con)

    try:
        specialty = request.form['specialty']
    except:
        flash("You have to choose your specialty")
        return render_template('two_image.html', app_config=con)

    # Check if user already exists
    username_db_record = db.find({'selector': {'username': username}})
    usernames = [u for u in username_db_record]
    if len(usernames) == 0:
        # brand new user; create
        # pdb.set_trace()
        user = {
            "type": "user",
            "username": username,
            "years_experience": years_exp,
            "specialty": specialty
        }
        # pdb.set_trace()
        doc_id, doc_rev = db.save(user)
        flash(f"Created User: {username}")

        # Make task for Image Compare - manually enter imageListName specific for now
        makeTask.main(user=username, imageListName='ikbeomDataICL1',
                      imageListType="compare", taskOrder=1)
        # Return to app
        # pdb.set_trace()
        return redirect(f'/two_image?username={username}')
    else:
        # User exists
        flash("That user exists already")
        return render_template('two_image.html', app_config=con)

    # results = json.loads("create_user - success")
    return redirect('/two_image')


@bp.route('/reset_to_previous_result/<app>', methods=['POST'])
def reset_to_previous_result(app):
    currentTask = json.loads(request.data)
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    # pdb.set_trace()
    # get old result
    if app.capitalize() == "Compare":
        view = f"_design/basic_views/_view/results{app.capitalize()}?key=[\"{currentTask['user']}\",\"{currentTask['list_name']}\"]"
    else:
        view = f"_design/basic_views/_view/results{app.capitalize()}_userList?key=[\"{currentTask['user']}\",\"{currentTask['list_name']}\"]"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    all_results = json.loads(response.content.decode('utf-8'))
    # pdb.set_trace()
    for row in all_results['rows']:
        # [row['value']['task_idx'] for row in all_results['rows']]
        if row['value']['task_idx'] + 1 == currentTask['current_idx']:
            # pdb.set_trace()
            old_result_id, old_result_rev = row['value']['_id'], row['value']['_rev']
    # pdb.set_trace()

    if len(old_result_id) == 0 or len(old_result_rev) == 0:
        pdb.set_trace()  # quick error handling till I properly implement

    # delete old result
    view = f"{old_result_id}?rev={old_result_rev}"
    url = f"{base}/{view}"
    # pdb.set_trace()
    response = check_if_admin_party_then_make_request(url, method="DELETE")
    delete_response_content = json.loads(response.content.decode('utf-8'))

    # adjust task idx
    view = f"{currentTask['_id']}?rev={currentTask['_rev']}"
    url = f"{base}/{view}"
    if currentTask['current_idx'] != 0 and not currentTask['current_idx'] < 0:
        currentTask['current_idx'] -= 1
    response = check_if_admin_party_then_make_request(
        url, method="PUT", data=json.dumps(currentTask))
    adjust_task_idx_response_content = json.loads(
        response.content.decode('utf-8'))

    return jsonify({'deleted_result_id': old_result_id, 'previous_result_id': old_result_rev})


@bp.route('/get_classification_results/', methods=['GET'])
def get_classification_results():
    username = request.args['username']
    list_name = request.args['list_name']
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    view = f"_design/basic_views/_view/resultsClassify?key=[\"{username}\",\"{list_name}\"]"
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
    # pdb.set_trace()

    return json.loads(response.content.decode('utf-8'))


@bp.route('/get_pair_results/', methods=['GET'])
def get_pair_results():
    username = request.args['username']
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    view = f"_design/basic_views/_view/resultsPair?key=\"{username}\""
    url = f"{base}/{view}"
    # pdb.set_trace()
    response = check_if_admin_party_then_make_request(url)

    return json.loads(response.content.decode('utf-8'))


# @bp.route('/delete_result/<app>', methods=['DELETE'])

def delete_result(_id, _rev):
    results = json.loads(request.data)
    # pdb.set_trace()
    # var url = `http://${current_app.config['DNS']}:${current_app.config["DB_PORT"]}/image_comparator/${doc._id}?rev=${doc._rev}`
    username = request.args['username']
    base = "http://{}:{}/{}".format(
        current_app.config['DNS'], current_app.config["DB_PORT"], current_app.config["IMAGES_DB"])
    view = f"_design/basic_views/_view/incomplete_{app}_tasks?key=\"{username}\""
    url = f"{base}/{view}"
    response = check_if_admin_party_then_make_request(url)
