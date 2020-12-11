#!/usr/bin/env python3
'''
-r
    Run in release mode instead of the default, debug. (see also the 'debug' variable in wsgi_app.py)
'''

import os, sys, mimetypes, threading
from datetime import datetime

print('pid:', os.getpid())

port = 8081

import static
import webob, wsgi_app

args = sys.argv[1:]

if '-r' not in args:
    wsgi_app.debug = True

if not hasattr(wsgi_app, 'main'):
    print('There was an error loading the main module.')

def application(env, start):
    'a simple file serving wrapper application for development purposes'
    req = webob.Request(env)
    resp = static.process(req, 'public')
    if resp != None:
        return resp(env, start)
    try:
        return wsgi_app.application(env, start)
    except SystemExit:
        print('shutting down server')
        shutdown()
        return webob.Response('{}')(env, start)

def shutdown():
    threading.Thread(target=httpd.shutdown).start()

from wsgiref.simple_server import make_server
httpd = make_server('', port, application)
print('serving on port %d' % port)
httpd.serve_forever()
