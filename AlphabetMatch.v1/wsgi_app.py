'''
The WSGI entry point module. This is a light wrapper around the core server program in main.py.
'''
import sys, os, time, json, traceback
# webob and main are imported below

debug = True

workdir = os.path.abspath(os.path.dirname(__file__))
os.chdir(workdir)
sys.path.append(workdir)

def handleError():
    if debug:
        msg = traceback.format_exc()
        print(msg)
    else:
        ts = time.ctime()
        f = open('error.log', 'a')
        f.write('\n' + ts + '\n')
        traceback.print_exc(file=f)
        f.close()
        msg = 'An error occurred at %s.\n\nPlease contact the administrator.' % ts
    return webob.Response(status=500, body=msg, content_type='text/plain')

def application(env, start):
    try:
        request = webob.Request(env)
        response = main.processRequest(request)
    except SystemExit:
        raise  # pass exit() on to caller
    except:
        response = handleError()

    response.headers['Access-Control-Allow-Origin'] = '*'
    
    return response(env, start)

try:
    if os.path.exists('interpreter'):
        interp = open('interpreter', 'r').read().strip()
        if sys.executable != interp:
            os.execl(interp, interp, *sys.argv)
    
    import webob, main
    
except:
    handleError()
