import os, datetime

from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from dotenv import load_dotenv


login_manager = LoginManager()


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.permanent_session_lifetime = datetime.timedelta(hours=1)
    load_dotenv(".env", verbose=True)
    app.config.from_mapping(
        # SECRET_KEY=b'',
        SECRET_KEY=os.getenv("SECRET_KEY")
    )
    
    # Get environ config    
    app.config['DB_ADMIN_USER'] = os.getenv("DB_ADMIN_USER")
    app.config['DB_ADMIN_PASS'] = os.getenv("DB_ADMIN_PASS")
    app.config['DNS'] = os.getenv("DNS")
    app.config['SSL'] =  True if os.getenv("SSL") == 'True' else False
    app.config['DB_DNS'] = os.getenv("DB_DNS")
    app.config['IMAGES_DB'] = os.getenv("IMAGES_DB")
    app.config['DB_PORT'] = os.getenv("DB_PORT")
    app.config['HTTP_PORT'] = os.getenv("HTTP_PORT")
    app.config['ADMIN_PARTY'] = True if os.getenv("ADMIN_PARTY") == 'True' else False
      
    # Initialize Plugins
    login_manager.init_app(app)

    # https://stackoverflow.com/questions/41543951/how-to-change-downloading-name-in-flask#:~:text=FileSaver%20will%20use%20the%20Content,as%20the%20filename%20by%20default.
    CORS(app, expose_headers=["Content-Disposition"])

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    
    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Register Blueprints
    from . import routes_blueprint
    from . import auth_blueprint
    app.register_blueprint(routes_blueprint.bp)
    app.register_blueprint(auth_blueprint.auth_bp)

    return app