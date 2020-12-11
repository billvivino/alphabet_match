import glob, sys, json

def getnames(user):
    names = set()
    for f in glob.glob('analytics/%s/*' % user):
        for line in open(f, 'r'):
            if '"adhoc"' in line:
                lst = json.loads(line)
                for e in lst:
                    if e['msg'] == 'adhoc':
                        names.add(e['name'])

    names = list(names)
    names.sort()
    if '' in names:
        names.remove('')

    return names
