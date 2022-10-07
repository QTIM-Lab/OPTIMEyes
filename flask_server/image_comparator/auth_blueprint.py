import pdb

from flask import (
    Blueprint,
    render_template,
    current_app,
    request
)
from . import login_manager
from image_comparator.db import get_db

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
    pdb.set_trace()
    couch = get_db()
    if type(user_id) == str:
        for usr in Users_DB:
            if usr.id == user_id:
                return usr # return User.get(user_id)
        return None
    
class User(UserMixin):
    """User account model."""

    def __init__(self, id, username, email):
        self.id = id
        self.username = username
        self.email = email
    
    def set_password(self, password):
        """Create hashed password."""
        self.password = generate_password_hash(
            password,
            method='sha256'
        )

    def check_password(self, password):
        """Check hashed password."""
        return check_password_hash(self.password, password)
    
    # Overridding UserMixin
    def get_id(self):
        try:
            # usually an id so maybe change from username in the future
            return str(self.id) 
        except AttributeError:
            raise NotImplementedError("No `id` attribute - override `get_id`") from None

    def __repr__(self):
        return '<User {}>'.format(self.username)
   
# Simulate DB
user_bbearce = User(id='1',
                    username="bbearce",
                    email="bbearce@gmail.com")
user_bbearce.set_password("pa$$word")

Users_DB = [user_bbearce]
 

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    # Signup logic goes here
    if request.method == 'GET':
        return render_template('signup.html', app_config=current_app.config)
    elif request.method == 'POST':
        # Validate data
        if type(request.form['username']) != str or len(request.form['username']) == 0:
            return render_template('signup.html', app_config=current_app.config, message="Username is blank or not a string.")
        if type(request.form['email']) != str or len(request.form['email']) == 0:
            return render_template('signup.html', app_config=current_app.config, message="Email is blank or not a string.")
        if type(request.form['psw']) != str or len(request.form['psw']) == 0:
            return render_template('signup.html', app_config=current_app.config, message="Password is blank or not a string.")
        # Check if user exists already
        for usr in Users_DB:
            if usr.username == request.form['username']:
                return render_template('signup.html', app_config=current_app.config, message="Username already exists, please use another.")
        
        # Find all user IDs and increment by 1
        largest_user_id = 1
        for usr in Users_DB:
            largest_user_id = max(int(usr.get_id()), largest_user_id)
            
        user = User(id=str(largest_user_id),
                    username=request.form['username'],
                    email=request.form['email'])
        user.set_password(request.form['psw'])
        Users_DB.append(user) # save action
        
        # Login
        login_user(user, remember=True)
        
        return render_template('index.html')

    

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Login route logic goes here
    if request.method == 'GET':
        if current_user.is_authenticated:
            return render_template('index.html')
        else:
            return render_template('login.html', app_config=current_app.config)    
    elif request.method == 'POST':
        # Search for user
        for usr in Users_DB:
            # if found
            if usr.username == request.form['username']:
                # check password
                if usr.check_password(request.form['psw']):
                    # If correct got to index
                    login_user(usr, remember=True)
                    return render_template('index.html')
                else:
                    return render_template('login.html', app_config=current_app.config, message="Try again please, incorrect password.")
        # User not found so let them know
        return render_template('signup.html', app_config=current_app.config, message=f"You don't have an account, please sign up.")
    return render_template('login.html', app_config=current_app.config)


@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    # Logout logic goes here
    logout_user()
    return render_template('logout.html', app_config=current_app.config)

