"""Build self-contained hosted and downloadable pages, plus a static-host ZIP."""
from pathlib import Path
import re, zipfile
root = Path(__file__).resolve().parents[1]
template = (root / 'templates/index.html').read_text()
parser = (root / 'cards.js').read_text().replace('export function ', 'function ')
mastery = re.sub(r'^import .*?;\n', '', (root / 'mastery.js').read_text(), flags=re.M).replace('export function ', 'function ').replace('export const ', 'const ')
exam = re.sub(r'^import .*?;\n', '', (root / 'exam.js').read_text(), flags=re.M).replace('export function ', 'function ')
backup = re.sub(r'^import .*?;\n', '', (root / 'backup.js').read_text(), flags=re.M).replace('export function ', 'function ')
layout = (root / 'pdf-layout.js').read_text().replace('export function ', 'function ')
runtime = (root / 'vendor/pdf-runtime.js').read_text().replace('</script', '<\\/script')
learn = (root / 'learn.js').read_text().replace('export function ', 'function ')
app = re.sub(r'^import .*?;\n', '', (root / 'app.js').read_text(), flags=re.M)
app = app.replace("const response=await fetch('./deck.json');if(!response.ok)throw new Error('Deck unavailable');state.cards=parseCards(await response.text());state.mastery=initializeMastery({...state,mastery:null});", "state.cards=parseCards(document.getElementById('included-deck').textContent);state.mastery=initializeMastery({...state,mastery:null});")
base = template.replace('<link rel="stylesheet" href="style.css">', '<style>' + (root / 'style.css').read_text() + '</style>')
deck = (root / 'deck.json').read_text().replace('<', '\\u003c')
def bundle(html, script):
    return html.replace('<script type="module" src="app.js"></script>', '<script>' + runtime + '</script><script id="included-deck" type="application/json">' + deck + '</script><script type="module">' + parser + '\n' + learn + '\n' + mastery + '\n' + exam + '\n' + backup + '\n' + layout + '\n' + script + '</script>')
(root / 'index.html').write_text(bundle(base, app))
standalone = re.sub(r'<link rel="(?:manifest|icon|apple-touch-icon)"[^>]*>', '', base)
script = re.sub(r"if\('serviceWorker' in navigator\)\{[^\n]*\}", "$('offline-status').textContent='Standalone edition · no server needed';", app)
(root / 'Pocket-Flashcards.html').write_text(bundle(standalone, script))
with zipfile.ZipFile(root / 'pocket-flashcards.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in ['index.html','style.css','app.js','cards.js','learn.js','exam.js','mastery.js','backup.js','pdf-layout.js','deck.json','sw.js','manifest.webmanifest','icons/icon.svg','icons/icon-192.png','icons/icon-512.png','README.md','IPHONE.md','vendor/pdfjs-LICENSE.txt']:
        archive.write(root / name, name)
print('Built self-contained index.html, Pocket-Flashcards.html, and pocket-flashcards.zip')
