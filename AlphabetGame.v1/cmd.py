import random
import database, students, graph

def checklogin(data):
    'return username if there is a valid token, False otherwise'
    if 'token' not in data:
        return False
    return database.verifyToken(data['token'])

def needlogin():
    return {'error': 'login', 'msg': 'Please log in.'}


def cmd_login(data):
    if 'token' in data:
        email = database.verifyToken(data['token'])
        if email:
            info = database.getAccountInfo(email)
            return {'token': data['token'], 'info': info}
        else:
            return {'error': 'login', 'msg': 'Token invalid or expired. Please log in again.'}

    email = data['email']
    pwd = data['password']
    
    if database.verifyLogin(email, pwd):
        token = database.createToken(email)
        info = database.getAccountInfo(email)
        return {'token': token, 'info': info}

    return {'error': 'login', 'msg': 'Incorrect username or password.'}

def cmd_profileLoad(data):
    device = database.getDeviceId(data['cacheid'])
    email = database.getDeviceAccount(device)
    if email is None:
        return {'error': 'noaccount', 'msg': 'No analytics account associated with this device.'}

    return {'data': database.getProfile(email, data['slot'])}

def cmd_profileSave(data):
    device = database.getDeviceId(data['cacheid'])
    email = database.getDeviceAccount(device)
    if email is None:
        return {'error': 'noaccount', 'msg': 'No analytics account associated with this device.'}
    
    pd = data['data']
    ts = data['ts']
    database.putProfile(email, data['slot'], pd, ts)
    return {}

def cmd_getconfig(data):
    if 'cacheid' in data:
        device = database.getDeviceId(data['cacheid'])
        email = database.getDeviceAccount(device)
    elif 'token' in data:
        email = database.verifyToken(data['token'])
    else:
        email = None

    if email is None:
        return {
            'config': None,
            'characters': None,
        }
    
    info = database.getAccountInfo(email)

    chars = {}
    for slot in database.getSlots(email):
        prof = database.getProfile(email, slot['id'])
        if prof:
            c = prof.get('character')
            if c is not None:
                chars[slot['id']] = c

    return {
        'config': info['config'],
        'characters': chars,
    }

def cmd_setprofilemode(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    assert data['mode'] in ('list', 'groups')
    
    info = database.getAccountInfo(email)
    info['config']['profile_mode'] = data['mode']
    
    database.setAccountInfo(email, info)
    return {}

def cmd_newslot(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    info = database.getAccountInfo(email)
    config = info['config']

    id = 1
    for slot in config['slots']:
        if slot['id'] >= id:
            id = slot['id'] + 1

    newslot = {
        'id': id,
        'name': 'New Student',
        'group': '',
        'active': True,
    }
    config['slots'].append(newslot)

    database.setAccountInfo(email, info)
    return {
        'newslot': newslot,
    }

def cmd_changeslot(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    info = database.getAccountInfo(email)
    config = info['config']

    if 'name' in data:
        assert type(data['name']) == str
    if 'group' in data:
        assert type(data['group']) == str
    if 'active' in data:
        assert type(data['active']) == bool

    for slot in config['slots']:
        if slot['id'] == data['id']:
            for key in ('name', 'group', 'active'):
                if key in data:
                    slot[key] = data[key]

    database.setAccountInfo(email, info)
    return {}

def cmd_analytics(data):
    maxid = None
    device = database.getDeviceId(data['cacheid'])

    for rec in data['events']:
        if rec['msg'] == 'device-ready' and rec['uuid']:
            database.groupDevices(data['cacheid'], rec['uuid'])
        database.reportAnalyticsEvent(data['cacheid'], rec)

        id = rec['msgid']
        if maxid is None or id > maxid:
            maxid = id

    return {
        'upto_id': maxid,
    }


def cmd_getlinkcode(data):
    device = database.getDeviceId(data['cacheid'])
    code = database.getLinkCode(device)
    return {
        'code': code,
    }

def cmd_linkdevice(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    code = data['code'].upper()
    device = database.linkDevice(code, email)
    if device is None:
        return {'error': 'link', 'msg': 'Failed to link device. Code invalid or expired.'}
    return {'device': device}

def cmd_unlinkdevice(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    device = data['device']
    database.unlinkDevice(email, device)
    return {}

def cmd_listdevices(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    info = []
    for dev in database.listDevices(email):
        d = database.getDeviceInfo(dev)
        if d is None:
            d = {}
        d['id'] = dev
        info.append(d)
    return {'devices': info}


def cmd_getanalyticstest(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    sessions = database.getProfileSessions(email)

    return {
        'sessions': sessions,
    }

def cmd_graphs(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    if email == 'admin':
        sessions = database.getAllSessions()
    else:
        sessions = database.getProfileSessions(email)

    p = graph.Plotter(email, sessions, data['segment'])
    graphs = p.make()

    return {
        'graphs': graphs,
    }

def cmd_getsegments(data):
    email = database.verifyToken(data['token'])
    if not email:
        return needlogin()

    return {
        'slots': database.getSlots(email),
    }
