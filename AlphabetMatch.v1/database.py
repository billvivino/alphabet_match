import re, os, time, psycopg2, hashlib, json, random
from psycopg2.extras import Json

# NB if finer grained account login is required, make "subaccounts"

create_sql = '''

create table accounts (email text primary key, pwdhash text, info jsonb);
create table sessions (token text primary key, email text, ts integer);

-- uuid is either a cacheid or a device uuid
create table device_uuid (uuid text primary key, device integer, ts integer);
create sequence device_seq;

create table device_link (device integer primary key, email text);
create index device_link_email on device_link (email);
create table device_linkcode (code text primary key, device integer, ts integer);

-- slot is "account/slotname"
create table profiles (slot text primary key, data jsonb, ts integer);

create table analytics (cacheid text, msgid integer, ts double precision, data jsonb, primary key (cacheid, msgid));
create index analytics_ts on analytics (ts);
'''

cacheidregex = re.compile(r'\d{8}-\d{6}-[0-9a-f]{8}$')  # for use with match()

db = psycopg2.connect(database='looloo')

def create():
    cur = db.cursor()
    cur.execute(create_sql)
    db.commit()

def commit():
    db.commit()

def rollback():
    db.rollback()


# accounts

def normalizeEmail(email):
    return email.lower().replace(' ', '')

def hashPassword(pwd):
    return hashlib.sha1(pwd.encode('utf8')).hexdigest()

def createAccount(email, pwd, allowExisting=False):
    email = normalizeEmail(email)
    ph = hashPassword(pwd)
    cur = db.cursor()
    if allowExisting:
        cur.execute('update accounts set pwdhash=%s where email=%s', (ph, email))
        if cur.rowcount:
            return
    cur.execute('insert into accounts (email, pwdhash, info) values (%s,%s,%s)', (email, ph, Json({})))

def accountExists(email):
    email = normalizeEmail(email)
    cur = db.cursor()
    cur.execute('select count(1) from accounts where email=%s', (email,))
    t = cur.fetchone()
    return bool(t[0])

'''
account info = {
  name: <str>,  # display name for the account (optional)

  config: {
    linked: true,  # only false on unlinked devices
    version: <str>,  # one of 'home', 'school'
    profile_mode: <str>,  # one of 'chars', 'list', 'groups'

    # optional:
    slot_group_limit: <int>,  # limit on number of groups (for profile_mode = 'groups')
    slot_list_limit: <int>,  # limit on slots in a group (for profile_mode = 'list' or 'groups')
    slot_limit: <int>,  # limit on total number of slots for this account (for profile_mode = 'list' or 'groups')

    slots: [<slot>],
    # slot = {id: <int>, name: <str>, group: <str>, active: <bool>}
    # group is only used when profile_mode is 'groups'
  },
}

see alphabet/config.js for default values of 'config'
'''

def getAccountInfo(email):
    cur = db.cursor()
    cur.execute('select info from accounts where email=%s', (email,))
    t = cur.fetchone()
    if not t:
        return None
    return t[0]

def setAccountInfo(email, info):
    verifyAccountInfo(info)
    cur = db.cursor()
    cur.execute('update accounts set info=%s where email=%s', (Json(info), email))

def verifyAccountInfo(info):
    'raise an exception if info is invalid. may modify info in-place.'
    if 'name' in info and type(info['name']) is not str:
        raise Exception('name in info but not a str')

    if not ('config' in info and type(info['config']) is dict):
        raise Exception('missing or non-dict "config"')
    config = info['config']

    if not ('version' in config and config['version'] in ('home', 'school')):
        raise Exception('missing or invalid "config.version"')
    
    if not ('profile_mode' in config and config['profile_mode'] in ('chars', 'list', 'groups')):
        raise Exception('missing or invalid "config.profile_mode"')
    
    if not ('slots' in config and type(config['slots']) is list):
        raise Exception('missing or non-list "config.slots"')
    for x in config['slots']:
        if not (type(x) is dict):
            raise Exception('slot is not dict')
        if not ('id' in x and type(x['id']) is int):
            raise Exception('slot has missing or invalid id')
        if not ('name' in x and type(x['name']) is str):
            raise Exception('slot has missing or invalid name')
        if not ('group' in x and type(x['group']) is str):
            raise Exception('slot has missing or invalid group')
        if not ('active' in x and type(x['active']) is bool):
            raise Exception('slot has missing or invalid active')

    config['linked'] = True


# devices

def getDeviceId(uuid):
    cur = db.cursor()
    cur.execute('select device from device_uuid where uuid=%s', (uuid,))
    t = cur.fetchone()
    if t is None:
        cur.execute("insert into device_uuid (uuid, device, ts) values (%s, nextval('device_seq'), %s)", (uuid, time.time()))
        cur.execute('select device from device_uuid where uuid=%s', (uuid,))
        t = cur.fetchone()
    return t[0]

def groupDevices(uuid1, uuid2):
    cur = db.cursor()
    cur.execute('select uuid, device, ts from device_uuid where uuid=%s or uuid=%s', (uuid1, uuid2))
    t = cur.fetchall()
    
    if len(t) == 2:
        uuid1, device1, ts1 = t[0]
        uuid2, device2, ts2 = t[1]
        if device1 != device2:
            if ts1 < ts2:  # 1 is older
                _changeDeviceId(device2, device1)
            else:
                _changeDeviceId(device1, device2)
                
    elif len(t) == 1:
        ruuid, rdevice, rts = t[0]
        if uuid1 != ruuid:
            x = (uuid1, rdevice, time.time())
        else:
            x = (uuid2, rdevice, time.time())
        cur.execute('insert into device_uuid (uuid, device, ts) values (%s,%s,%s)', x)
        
    else:
        device = getDeviceId(uuid1)
        cur.execute('insert into device_uuid (uuid, device, ts) values (%s,%s,%s)', (uuid2, device, time.time()))

def _changeDeviceId(a, b):
    'change device id "a" to "b", because they are the same device'
    cur = db.cursor()
    cur.execute('update device_uuid set device=%s where device=%s', (b, a))

def getDeviceAccount(device):
    cur = db.cursor()
    cur.execute('select email from device_link where device=%s', (device,))
    t = cur.fetchone()
    if t is None:
        return None
    return t[0]

def getDeviceInfo(device):
    cacheids = getCacheIds(device)
    
    best = None
    bestts = 0
    cur = db.cursor()
    for cacheid in cacheids:
        cur.execute("select data, ts from analytics where cacheid=%s and data->>'msg'='device-ready' order by ts desc limit 1", (cacheid,))
        t = cur.fetchone()
        if t:
            info, ts = t
            if ts > bestts:
                bestts = ts
                best = {
                    'model': info['model'],
                    'platform': info['platform'],
                    'uuid': info['uuid'],
                }
    return best

def getCacheIds(device):
    cur = db.cursor()
    cur.execute('select uuid from device_uuid where device=%s', (device,))
    cacheids = []
    for uuid, in cur:
        if cacheidregex.match(uuid):
            cacheids.append(uuid)
    return cacheids

def getAllCacheIds():
    cur = db.cursor()
    cur.execute('select uuid from device_uuid')
    cacheids = []
    for uuid, in cur:
        if cacheidregex.match(uuid):
            cacheids.append(uuid)
    return cacheids


CODE_EXPIRY = 3600 * 2  # two hours

def getLinkCode(device):
    cur = db.cursor()
    cur.execute('delete from device_linkcode where ts < %s', (time.time() - CODE_EXPIRY,))
    cur.execute('select code, ts from device_linkcode where device=%s', (device,))
    t = cur.fetchone()
    if t is not None:
        return t[0]

    cur.execute('delete from device_linkcode where device=%s', (device,))
    for _ in range(100):
        code = ''.join(random.choice('BCDFGHJKLMNPQRSTVWXYZ') for i in range(4))
        cur.execute('select count(1) from device_linkcode where code=%s', (code,))
        if cur.fetchone()[0] == 0:
            cur.execute('insert into device_linkcode (device, code, ts) values (%s,%s,%s)', (device, code, time.time()))
            return code

    # this should basically never happen
    raise Exception('failed to generate code')

def linkDevice(code, email):
    'return device id if successful, otherwise None'
    cur = db.cursor()
    cur.execute('select device, ts from device_linkcode where code=%s', (code,))
    t = cur.fetchone()
    if not t or t[1] + CODE_EXPIRY < time.time():
        return None
    device = t[0]

    cur.execute('delete from device_linkcode where code=%s', (code,))
    cur.execute('delete from device_link where device=%s', (device,))
    cur.execute('insert into device_link (device, email) values (%s,%s)', (device, email))
    return device

def unlinkDevice(email, device):
    'clear link between email and device'
    cur = db.cursor()
    cur.execute('delete from device_link where email=%s and device=%s', (email, device))

def listDevices(email):
    cur = db.cursor()
    cur.execute('select device from device_link where email=%s', (email,))
    return [t[0] for t in cur]


# account sessions

TOKEN_EXPIRY = 3600 * 24 * 14  # two weeks

def verifyLogin(email, pwd):
    email = normalizeEmail(email)
    ph = hashPassword(pwd)
    cur = db.cursor()
    cur.execute('select pwdhash from accounts where email=%s', (email,))
    t = cur.fetchone()
    if t and ph == t[0]:
        return True
    return False

def verifyToken(token):
    'return email if session token is valid, False otherwise'
    cur = db.cursor()
    cur.execute('select email, ts from sessions where token=%s', (token,))
    t = cur.fetchone()
    if not t:
        return False
    email, ts = t
    if time.time() - ts > TOKEN_EXPIRY:
        return False
    cur.execute('update sessions set ts=%s where token=%s', (time.time(), token))
    return email

def createToken(email):
    token = ''.join('0123456789abcdef'[random.randint(0, 15)] for i in range(32))
    cur = db.cursor()
    cur.execute('insert into sessions (email, token, ts) values (%s,%s,%s)', (email, token, time.time()))
    return token


# player profiles

def getSlots(email):
    info = getAccountInfo(email)
    return info['config']['slots']

def getProfile(email, slotname):
    slot = '%s/%s' % (email, slotname)
    
    cur = db.cursor()
    cur.execute('select data from profiles where slot=%s', (slot,))
    t = cur.fetchone()
    if t is None:
        return None
    return t[0]

def putProfile(email, slotname, data, ts):
    slot = '%s/%s' % (email, slotname)
    cur = db.cursor()
    cur.execute('insert into profiles (slot, data, ts) values (%s,%s,%s) on conflict (slot) do update set data=excluded.data, ts=excluded.ts where excluded.ts > profiles.ts', (slot, Json(data), ts))


# analytics

def reportAnalyticsEvent(cacheid, event):
    event = dict(event)
    msgid = event.pop('msgid')
    ts = event.pop('ts')

    cur = db.cursor()
    cur.execute('insert into analytics (cacheid, msgid, ts, data) values (%s,%s,%s,%s) on conflict do nothing', (cacheid, msgid, ts, Json(event)))

def getProfileSessions(email):
    '''
    return [<session>]
    session = [(ts, data)]

    the returned list will be sorted by the first ts in each session.
    the first data in a session will be a 'select' message, giving the profile slot.
    '''
    devices = listDevices(email)
    sessions = []  # [[(ts, data)]]
    
    for dev in devices:
        for cacheid in getCacheIds(dev):
            sessions += getCacheSessions(cacheid)

    sessions.sort(key=lambda s: s[0][0])
    return sessions

def getAllSessions():
    'same interface as getProfileSessions()'
    sessions = []
    for cacheid in getAllCacheIds():
        sessions += getCacheSessions(cacheid)

    sessions.sort(key=lambda s: s[0][0])
    return sessions

def getCacheSessions(cacheid):
    session = None
    sessions = []
    
    cur = db.cursor()
    cur.execute('select ts, data from analytics where cacheid=%s order by msgid', (cacheid,))
    for ts, data in cur:

        if data['msg'] == 'select':
            session = []
            sessions.append(session)
        elif data['msg'] == 'changescreen' and data['dest'] == 'Profile':
            session = None
        elif data['msg'] == 'app-start':
            session = None

        if session is not None:
            session.append((ts, data))
    return sessions
