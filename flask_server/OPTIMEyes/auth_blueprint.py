import pdb, json

from flask import (
    Blueprint,
    render_template,
    current_app,
    request,
    url_for,
    redirect,
    flash,
    jsonify
)
from . import login_manager
from OPTIMEyes.db import get_server

from flask_login import UserMixin, login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# Blueprint Configuration
auth_bp = Blueprint(
    'auth_bp', __name__,
    template_folder='templates',
    static_folder='static'
)


@login_manager.user_loader
def load_user(user_id):
    """Note:
    * Because the flask session uses cookies, the data is persisted even if the user closes the window.
    * This means when you go to /login, flask grabs current user and loads into user_id above.
    * We need to get the user_id from here and return it...right now that is username but should change
    https://stackoverflow.com/questions/37227780/flask-session-persisting-after-close-browser
    """
    # It should return None (not raise an exception) if the ID is not valid. (In that case, the ID will manually be removed from the session and processing will continue.)
    couch_server = get_server(); db = couch_server['image_comparator'];
    users = [user for user in db.view("users/users", key=user_id)]
    if len(users) == 0:
        return None
    elif len(users) > 1:
        print("Somehow we have 2 users with the same ID...what to do??")
    else:
        # pdb.set_trace()
        user = User(id=user_id, 
                    username=users[0].value['username'], 
                    email=users[0].value['email'], 
                    admin=users[0].value['admin'])
        user.password = users[0].value['password']
        return user
        # Test dictionary DB
        # for usr in Users_DB:
        #     if usr.id == user_id:
        #         return usr # return User.get(user_id)
        # return None
    
class User(UserMixin):
    """User account model."""

    def __init__(self, id, username, email, admin):
        self.id = id
        self.username = username
        self.email = email
        self.admin = admin
    
    def set_password(self, password):
        """Create hashed password."""
        self.password = generate_password_hash(
            password,
            method='scrypt'
        )

    def check_password(self, password):
        if self.password.startswith('sha256$'):  # Check for SHA256 prefix
            # Note: This is getting deprecated so have everyone change their password
            #       so that it is encrypted with scrypt versus the older sha256
            return check_password_hash(self.password, password, method='sha256')
        else:
            return check_password_hash(self.password, password)  # Assume scrypt
    
    # Overridding UserMixin
    def get_id(self):
        try:
            # usually an id so maybe change from username in the future
            return str(self.id) 
        except AttributeError:
            raise NotImplementedError("No `id` attribute - override `get_id`") from None

    def save(self, db):
        updated_doc = self.serialize_for_couchdb()
        updated_doc['_rev'] = db[f'user_{self.username}']['_rev']
        # import pdb; pdb.set_trace()
        db[f'user_{self.username}'] = updated_doc

    def serialize_for_couchdb(self):
        dictionary_representation = {
            "type":"user",
            "username":self.username,
            "email":self.email,
            "admin":self.admin,
            "password": self.password
        }
        # pdb.set_trace()
        return dictionary_representation

    def __repr__(self):
        return '<User {}>'.format(self.username)
   
# Simulate DB
# user_bbearce = User(id='user_bbearce',
#                     username="bbearce",
#                     email="bbearce@gmail.com")
# user_bbearce.set_password("pa$$word")

# Users_DB = [user_bbearce]
 
@auth_bp.route('/vuetify_test')
def vuetify_test():
    # pdb.set_trace()
    return render_template('/vuetify_components/base.html', logged_in=current_user.is_authenticated)


@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    couch_server = get_server(); db = couch_server['image_comparator'];
    # Signup logic goes here
    if request.method == 'GET':
        # return render_template('signup.html')
        return render_template('vuetify_components/signup.html')
    elif request.method == 'POST':
        # Validate data
        if type(request.form['username']) != str or len(request.form['username']) == 0:
            flash("Username is blank or not a string.")
            return render_template('signup.html')
        if type(request.form['email']) != str or len(request.form['email']) == 0:
            flash("Email is blank or not a string.")
            return render_template('signup.html')
        if type(request.form['password']) != str or len(request.form['password']) == 0:
            flash("Password is blank or not a string.")
            return render_template('signup.html')
        # Check if user exists already
        users = [user for user in db.view("users/users", key=f"user_{request.form['username']}")]
        if len(users) == 0:
            # Sign up...
            # Create New User
            user = User(id=f"user_{request.form['username']}",
                        username=request.form['username'],
                        email=request.form['email'],
                        admin=False)
            user.set_password(request.form['password'])
            # Test dictionary DB
            # Users_DB.append(user)

            # Save New User
            db[user.id] = user.serialize_for_couchdb()
            # Login
            login_user(user, remember=True)
        elif len(users) > 1:
            print("Somehow we have 2 users with the same ID...what to do??")
            pdb.set_trace()
        else:            
            # Test dictionary DB
            # for row in db.view("users/users"): # might have been indented differently
            #     if row.id == f"user_{request.form['username']}":
            #         flash(message="Username already exists, please use another.")
            #         return render_template('signup.html', app_config=current_app.config)
            # Test dictionary DB
            # for usr in Users_DB:
            #     if usr.username == request.form['username']:
            #         return render_template('signup.html', app_config=current_app.config, message="Username already exists, please use another.")

            # User exists
            # pdb.set_trace()
            # flash("User already exists. Try a new username.")
            
            return(jsonify("User already exists. Try a new username."))

        return(jsonify(f"Created user {request.form['username']}."))

    

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    couch_server = get_server(); db = couch_server['image_comparator'];
    # Login route logic goes here
    if request.method == 'GET':
        if current_user.is_authenticated:
            #return redirect(url_for('routes_blueprint.index'))
            return redirect(url_for('routes_blueprint.main_dashboard'))
        else:
            #return render_template('login.html', app_config=current_app.config)
            return render_template('vuetify_components/login.html')
    elif request.method == 'POST':
        # Search for user
        users = [user for user in db.view("users/users", key=f"user_{request.form['username']}")]
        if len(users) == 0:
            # No user found
            flash("User not found. Please sign up! :)")
            return redirect(url_for('auth_bp.signup'))
        elif len(users) > 1:
            print("In /login and we have multiple users for the given login username!")
            pdb.set_trace()
        # pdb.set_trace()
        user = User(id=f"user_{users[0].value['username']}",username=users[0].value['username'],email=users[0].value['email'],admin=users[0].value['admin'])
        user.password = users[0].value['password']
        if user.check_password(request.form['password']):
            login_user(user, remember=True)
            return redirect(url_for('routes_blueprint.main_dashboard'))
        else:
            flash("Try again please, incorrect password.")
            return render_template('vuetify_components/login.html')
        # Test dictionary DB
        # for usr in Users_DB:
        #     # if found
        #     if usr.username == request.form['username']:
        #         # check password
        #         if usr.check_password(request.form['password']):
        #             # If correct got to index
        #             login_user(usr, remember=True)
        #             return redirect(url_for('routes_blueprint.index'))
        #         else:
        #             return render_template('login.html', app_config=current_app.config, message="Try again please, incorrect password.")
        # User not found so let them know
    flash("This is not a GET or POST request, which is required.")
    return render_template('vuetify_components/login.html')


@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    # Logout logic goes here

    logout_user()
    flash('You were successfully logged out')
    return redirect(url_for('routes_blueprint.vue_index'))

