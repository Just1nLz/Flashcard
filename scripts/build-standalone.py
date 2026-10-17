"""Build an offline HTML download plus a static-host ZIP without dependencies."""
from pathlib import Path
import re, zipfile
root = Path(__file__).resolve().parents[1]
html = (root / 'index.html').read_text()
parser = (root / 'cards.js').read_text().replace('export function ', 'function ')
learn = (root / 'learn.js').read_text().replace('export function ', 'function ')
app = (root / 'app.js').read_text()
app = re.sub(r'^import .*?;\n', '', app, flags=re.M)
app = app.replace("const response=await fetch('./deck.json');if(!response.ok)throw new Error('Deck unavailable');state.cards=parseCards(await response.text());", "state.cards=parseCards(document.getElementById('included-deck').textContent);")
# Drop only the hosted service-worker registration; retain Learn-mode handlers.
app = re.sub(r"if\('serviceWorker' in navigator\)\{[^\n]*\}", "$('offline-status').textContent='Standalone edition · no server needed';", app)
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>' + (root / 'style.css').read_text() + '</style>')
html = re.sub(r'<link rel="(?:manifest|icon|apple-touch-icon)"[^>]*>', '', html)
deck = (root / 'deck.json').read_text().replace('<', '\\u003c')
html = html.replace('<script type="module" src="app.js"></script>', '<script id="included-deck" type="application/json">' + deck + '</script><script type="module">' + parser + '\n' + learn + '\n' + app + '</script>')
output = root / 'Pocket-Flashcards.html'
output.write_text(html)
with zipfile.ZipFile(root / 'pocket-flashcards.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in ['index.html','style.css','app.js','cards.js','learn.js','deck.json','sw.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','README.md','IPHONE.md']:
        archive.write(root / name, name)
print(f'Built {output} and pocket-flashcards.zip')
