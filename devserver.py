#!/usr/bin/env python3
"""Dev server for Dead Set: like `python3 -m http.server` but sends no-cache
headers so the browser always fetches fresh JS after an edit.
Usage: python3 devserver.py [port] [directory]"""
import functools
import http.server
import os
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        # dev helper: POST a canvas dataURL to /shot and it lands on disk
        if self.path != '/shot':
            self.send_response(404)
            self.end_headers()
            return
        import base64
        length = int(self.headers.get('Content-Length', 0))
        data = self.rfile.read(length).decode()
        payload = data.split(',', 1)[1] if ',' in data else data
        with open(os.path.join(self.directory, 'debug-shot.jpg'), 'wb') as f:
            f.write(base64.b64decode(payload))
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'ok')


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
directory = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(__file__))
handler = functools.partial(NoCacheHandler, directory=directory)
print(f'Serving {directory} at http://localhost:{port} (no-cache)')
http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
