'''
The main server program, a webob application.
'''
import os, sys, json, traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wsgi_app, cmd, database
from common import *

def processRequest(req):
    debug = wsgi_app.debug

    c = req.path_info_pop()

    func = getattr(cmd, 'cmd_' + c, None)
    if func != None:
        if debug:
            debugprint('->', '/' + c, req.body)

        try:
            data = json.loads(req.body.decode('utf8'))
        except:
            return badRequest()

        try:
            resp = func(data)
            resp = json.dumps(resp)
        except:
            database.rollback()
            raise
        else:
            database.commit()

        if debug:
            debugprint('<-', resp)

        return webob.Response(resp, 200)

    return notFound()
