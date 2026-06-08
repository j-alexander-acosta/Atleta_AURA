import re

with open('app.js', 'r') as f:
    app_js = f.read()

with open('index.html', 'r') as f:
    index_html = f.read()

# Find all document.getElementById('...')
ids_in_js = re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", app_js)

missing = []
for id in ids_in_js:
    if f'id="{id}"' not in index_html and f"id='{id}'" not in index_html:
        missing.append(id)

print("Missing IDs in index.html:", set(missing))
