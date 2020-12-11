'''Serve static files from scripts. Only for development purposes.'''
import os, re, mimetypes, webob
from datetime import datetime

def process(req, static_dir):
    'return webob.Response or None'
    # FIXME url might contain % encoded chars??
    path = os.path.join(static_dir, req.path_info.lstrip('/'))
    if '/../' in path:
        return None
    if os.path.isdir(path):
        if path[-1:] != '/':
            return webob.Response(status=301, location=req.path_info + '/')
        elif os.path.isfile(path + 'index.html'):
            path += 'index.html'
    if not os.path.isfile(path):
        return None
    mtime = datetime.fromtimestamp(int(os.path.getmtime(path)))
    ifmodsince = req.if_modified_since
    if ifmodsince != None:
        ifmodsince = ifmodsince.replace(tzinfo=None)
        if mtime <= ifmodsince:
            return webob.Response(status=304)
    f = open(path, 'rb')
    cont, enct = mimetypes.guess_type(path)
    if cont == None:
        cont = 'application/octet-stream'
    return webob.Response(body_file=f, last_modified=mtime, content_type=cont)
