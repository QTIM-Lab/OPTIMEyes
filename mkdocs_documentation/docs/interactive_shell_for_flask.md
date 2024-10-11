# Interactive shell for flask
```bash
docker compose exec -it flask bash
flask shell
```

then:
```python
from OPTIMEyes.auth_blueprint import load_user
from OPTIMEyes.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']
user = load_user('user_bbearce')
user.set_password("password")
user.save(db)
```

Download Annotations:
```python
from OPTIMEyes.routes_blueprint import downloadAnnotations
App="monaiSegmentation"
user = 'bbearce'
list_name =f'test_data-monaiSegmentation-0'
task_id = f"{user}-{list_name}"
zip_path = f"TMP/{user}-{list_name}.zip"
downloadAnnotations(App, task_id, cli=True, zip_path=zip_path)
```

Change Passwords:
```python
from OPTIMEyes.auth_blueprint import load_user
from OPTIMEyes.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']
user = load_user('user_bbearce')
user.set_password("password")
user.save(db)
```

```python
from OPTIMEyes.auth_blueprint import load_user
from OPTIMEyes.db import get_server
# Get the database instance
couch_server = get_server()
db = couch_server['image_comparator']

user = load_user('')
user.set_password("")
user.save(db)

user_pass=[
('guest', 'testtest')
]

for u, p in user_pass:
    print(u)
    print(p)


for u, p in user_pass:
    user = load_user(f'user_{u}')
    print(f'{u} {p}')
    user.set_password(p)
    user.save(db)
# head -c 16 /dev/urandom | base64
```