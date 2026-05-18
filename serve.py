#!/usr/bin/env python3
"""
One-Shop local dev server — nahrazuje: python3 -m http.server 8181
Přidává endpoint POST /api/upload pro hromadný upload obrázků.

Spuštění: python3 serve.py
Web:      http://localhost:8181
Uploader: http://localhost:8181/letak-uploader.html
"""
import http.server
import socketserver
import json
import os
import re
from email import message_from_bytes

PORT = 8181
BASE = os.path.dirname(os.path.abspath(__file__))


def sanitize(name):
    name = os.path.basename(name)
    name = re.sub(r'[^\w\-_\.]', '_', name)
    return name or 'upload'


def parse_multipart(headers, body):
    """Parse multipart/form-data without the removed cgi module."""
    content_type = headers.get('Content-Type', '')
    raw = f'Content-Type: {content_type}\r\n\r\n'.encode() + body
    msg = message_from_bytes(raw)
    fields = {}
    files = []
    for part in msg.walk():
        if part.get_content_maintype() == 'multipart':
            continue
        cd = part.get('Content-Disposition', '')
        name_m = re.search(r'name="([^"]*)"', cd)
        file_m = re.search(r'filename="([^"]*)"', cd)
        if not name_m:
            continue
        payload = part.get_payload(decode=True) or b''
        if file_m:
            files.append({'field': name_m.group(1), 'filename': file_m.group(1), 'data': payload})
        else:
            fields[name_m.group(1)] = payload.decode('utf-8')
    return fields, files


class Handler(http.server.SimpleHTTPRequestHandler):

    def do_OPTIONS(self):
        self._cors(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/clear-letak':
            try:
                self._update_letak([])
                self._json({'ok': True})
            except Exception as exc:
                self._json({'ok': False, 'error': str(exc)}, 500)
            return

        if self.path != '/api/upload':
            self.send_error(404)
            return
        try:
            content_len = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_len)
            fields, files = parse_multipart(self.headers, body)

            mode        = fields.get('mode', 'letak')
            store_index = fields.get('store_index', None)

            uploads_dir = os.path.join(BASE, 'img', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)

            saved = []
            for item in files:
                if item['field'] != 'files' or not item['filename']:
                    continue
                fname = sanitize(item['filename'])
                dest  = os.path.join(uploads_dir, fname)
                with open(dest, 'wb') as f:
                    f.write(item['data'])
                saved.append(f'/img/uploads/{fname}')

            if not saved:
                self._json({'ok': False, 'error': 'Žádné soubory nebyly nahrány.'}, 400)
                return

            if mode == 'letak':
                self._update_letak(saved)
            elif mode == 'store' and store_index is not None:
                self._update_store(int(store_index), saved[:4])

            self._json({'ok': True, 'files': saved})

        except Exception as exc:
            self._json({'ok': False, 'error': str(exc)}, 500)

    def _update_json(self, filename, mutate):
        path = os.path.join(BASE, 'data', filename)
        with open(path, encoding='utf-8') as f:
            data = json.load(f)
        mutate(data)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _update_letak(self, paths):
        self._update_json('letak.json', lambda d: d.update({'pages': paths}))

    def _update_store(self, idx, paths):
        def mutate(data):
            root = data.get('root', data)
            if idx < 0 or idx >= len(root):
                raise IndexError(f'Pobočka #{idx} neexistuje.')
            store = root[idx]
            for i in range(4):
                store[f'photo_{i+1}'] = paths[i] if i < len(paths) else ''
        self._update_json('stores.json', mutate)

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self._cors(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _cors(self, code):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def log_message(self, fmt, *args):
        # Suppress per-request noise; only show errors
        if args and str(args[1]) not in ('200', '304'):
            super().log_message(fmt, *args)


if __name__ == '__main__':
    os.chdir(BASE)
    with socketserver.TCPServer(('', PORT), Handler) as srv:
        print(f'One-Shop dev server  →  http://localhost:{PORT}')
        print(f'Uploader             →  http://localhost:{PORT}/letak-uploader.html')
        print('Ctrl+C pro zastavení')
        srv.serve_forever()
