import os
import tempfile

import pytest

from image_comparator import create_app
# from flaskr.db import init_db

# Configures the application for testing and initializes a new database (tbd)
@pytest.fixture
def client():
    db_fd, db_path = tempfile.mkstemp()
    app = create_app({'TESTING': True, 
                    #   'DATABASE': db_path
    })

    with app.test_client() as client:
        with app.app_context():
            # init_db()
            pass # needed if init_db() isn't there
        yield client

    os.close(db_fd)
    os.unlink(db_path)

# Tests
def test_hello_view(client):
    """Gather and test hello route text"""

    rv = client.get('/hello')
    assert b'Hello, World!' in rv.data