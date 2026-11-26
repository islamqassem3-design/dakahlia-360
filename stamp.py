# Cache-busting: stamp every local ES-module import, the app script and the stylesheet with ?v=<version>,
# so browsers fetch fresh files after each release instead of mixing cached old modules.
# Usage: python3 stamp.py [version]   (default: current UTC timestamp). Idempotent.
import re, sys, pathlib, time
root = pathlib.Path(__file__).resolve().parent
v = sys.argv[1] if len(sys.argv) > 1 else time.strftime('%Y%m%d%H%M', time.gmtime())
imp = re.compile(r"""((?:from|import)\s*\(?\s*['"])(\.{1,2}/[^'"?]+\.js)(?:\?v=[\w.-]+)?(['"])""")
for f in (root / 'assets' / 'js').rglob('*.js'):
    s = f.read_text(encoding='utf-8'); n = imp.sub(lambda m: f"{m.group(1)}{m.group(2)}?v={v}{m.group(3)}", s)
    if n != s: f.write_text(n, encoding='utf-8')
h = root / 'index.html'; s = h.read_text(encoding='utf-8')
s = re.sub(r'(src="assets/js/app\.js)(?:\?v=[\w.-]+)?"', rf'\1?v={v}"', s)
s = re.sub(r'(href="assets/css/app\.css)(?:\?v=[\w.-]+)?"', rf'\1?v={v}"', s)
h.write_text(s, encoding='utf-8')
print('stamped', v)
