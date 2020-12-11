#!/usr/bin/python3
'''
Arguments are passed on to test.py. See that file for argument specifications.
'''

import os, sys, time
from subprocess import Popen, PIPE

def checkfiles(d):
    ret = False
    hit = set()
    for path, dirs, files in os.walk('.'):
        for f in files:
            if f.endswith('.py'):
                f = os.path.join(path, f)
                try:
                    m = os.stat(f).st_mtime
                except OSError:
                    continue
                if f not in d or d[f] < m:
                    d[f] = m
                    ret = True
                hit.add(f)
    for f in set(d) - hit:
        del d[f]
        ret = True
    return ret

def restart():
    global p
    if p:
        print('terminating...')
        p.terminate()
        p.wait()
    print('starting...', ('(args: %s)' % ' '.join(args) if args else ''))
    p = Popen([sys.executable, 'test.py'] + args)

args = sys.argv[1:]

d = {}
p = None
while 1:
    if p and p.poll() != None:
        print('crashed')
        p.wait()
        time.sleep(3)
        restart()
    elif checkfiles(d):
        restart()
    time.sleep(1)
