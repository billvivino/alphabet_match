import re, sys, glob, json, time, psycopg2
from psycopg2.extras import Json

# usr/pwd: study/kean123
Email = 'study'
WRITE = True

db = psycopg2.connect(database='looloo')
cur = db.cursor()

cur.execute('select device from device_link where email=%s', (Email,))
t = cur.fetchone()
if t != None:
    Device, = t
else:
    cur.execute("insert into device_link (device, email) values (nextval('device_seq'), %s) returning device", (Email,))
    Device = cur.fetchone()[0]

def prepcache(cacheid):
    cur.execute('delete from analytics where cacheid=%s', (cacheid,))
    cur.execute('delete from device_uuid where uuid=%s', (cacheid,))
    cur.execute('insert into device_uuid (uuid, device, ts) values (%s,%s,%s)', (cacheid, Device, time.time()))

def addmsg(cacheid, msgid, ts, data):
    #print('adding', cacheid, msgid, ts)
    cur.execute('insert into analytics (cacheid, msgid, ts, data) values (%s,%s,%s,%s)', (cacheid, msgid, ts, Json(data)))

diffstate = {}  # {slotname: difficulty_array}

for fn in sorted(glob.glob('data/*')):
    print('loading from', fn)
    cacheid = fn.split('/')[-1].replace('--', '_').replace('-', '').replace('_', '-')
    prepcache(cacheid)
    msgid = 1

    dupcheck = set()
    
    session = []
    goal = None
    goaltime = None
    combo = 0
    slot = None
    with open(fn, 'r') as f:
        for line in f:
            for data in json.loads(line):
                msgdata = json.dumps(data, sort_keys=True)
                if msgdata in dupcheck:
                    continue
                dupcheck.add(msgdata)
                
                ts = data.pop('ts')
                if 'msg' not in data:
                    data['msg'] = 'UNKNOWN'

                extra = None
                
                if data['msg'] == 'select':
                    if type(data['slot']) == str and re.match(r'student/[12]0[0-9]$', data['slot']):
                        data['slot'] = int(data['slot'].split('/')[-1])

                        slot = data['slot']
                        if slot not in diffstate:
                            diffstate[slot] = [0] * (26*2)
                        extra = {
                            'msg': 'profile-data',
                            'data': {'levels': list(diffstate[slot])},
                        }
                    else:
                        slot = None

                if slot != None:
                    if data['msg'] == 'newletter':
                        goal = data['goal']
                        lowercase = data['choices'][0].islower()
                        wrong = 0
                        remaining = data['choices'].lower().count(goal)
                        goaltime = ts
                        cloudcleared = False

                    if data['msg'] == 'cloudclear':
                        cloudcleared = True

                    if data['msg'] == 'pick':
                        if data['letter'].lower() != goal:
                            wrong += 1
                        else:
                            remaining -= 1
                            if remaining == 0:
                                score = .5 + .1 * combo
                                combo += 1
                                if wrong > 0 or ts - goaltime > 10 or cloudcleared:
                                    score = -.33334
                                    combo = 0
                                if score > 1:
                                    score = 1

                                i = 'abcdefghijklmnopqrstuvwxyz'.index(goal) + 26 * lowercase
                                old = diffstate[slot][i]
                                diffstate[slot][i] += score
                                if diffstate[slot][i] < 0:
                                    diffstate[slot][i] = 0
                                if diffstate[slot][i] > 5.5:
                                    diffstate[slot][i] = 5.5

                                extra = {
                                    'msg': 'diff_update',
                                    'delta': diffstate[slot][i] - old,
                                }

                session.append((cacheid, msgid, ts, data))
                msgid += 1
                if extra:
                    session.append((cacheid, msgid, ts, extra))
                    msgid += 1

    if WRITE:
        # reassign msgids based on timestamp
        session.sort(key=lambda t: (t[2], t[1]))
        session = [(c, M+1, t, d) for M, (c, m, t, d) in enumerate(session)]

        if len(session) > 1:
            for args in session:
                addmsg(*args)

    #print('    msg count =', msgid - 1)

db.commit()
