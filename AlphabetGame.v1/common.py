'''
Utility functions.
'''
import webob


def debugprint(*args):
    s = ' '.join(map(str, args))
    if len(s) > 80:
        s = s[:77] + '...'
    print(s)

    
def notFound():
    'returns a webob Response indicating document not found'
    return webob.Response('Not Found', 404)

def badRequest():
    'returns a webob Response indicating a client error'
    return webob.Response('Bad Request', 400)


def needLogin():
    'returns a JSON response indicating the user is not authenticated.'
    return {'error': 'needlogin', 'msg': 'You must be logged in to do that.'}
