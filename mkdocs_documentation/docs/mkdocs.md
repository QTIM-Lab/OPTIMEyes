# Mkdocs
```bash
# pyenv virtualenv 3.10.4 optimeyes
pyenv activate optimeyes
pip install -r requirements.txt
mkdocs new mkdocs_documentation
cd mkdocs_documentation
mkdocs serve
mkdocs build
mkdocs gh-deploy
```