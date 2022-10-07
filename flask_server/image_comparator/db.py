import couchdb, pdb
import click
from flask import current_app, g


def get_db():
    """
    We add db to g to get access to app.config:
    https://flask.palletsprojects.com/en/2.2.x/tutorial/database/
    
    g is a special object that is unique for each request. 
    It is used to store data that might be accessed by multiple 
    functions during the request. The connection is 
    stored and reused instead of creating a new connection 
    if get_db is called a second time in the same request.
    
    current_app is another special object that points to the 
    Flask application handling the request. Since you used an 
    application factory, there is no application object when 
    writing the rest of your code. get_db will be called when 
    the application has been created and is handling a request, 
    so current_app can be used.
    """
    if 'db' not in g:
        U = current_app.config["DB_ADMIN_USER"]
        P = current_app.config["DB_ADMIN_PASS"]
        DNS = current_app.config["DNS"]
        PORT = current_app.config["DB_PORT"]
        url = f'http://{U}:{P}@{DNS}:{PORT}'
        g.db = couchdb.Server(url)

    return g.db