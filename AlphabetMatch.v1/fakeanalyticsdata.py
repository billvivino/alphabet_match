import sys, time, random
import database

linkemail = sys.argv[1]

cur = database.db.cursor()

def fakemsg(msg):
    global msgid
    msg['msgid'] = msgid
    msgid += 1
    msg['ts'] = ts
    database.reportAnalyticsEvent(cacheid, msg)

# students
for slot in range(1, 7):
    cacheid = '20191201-120000-%08d' % slot
    
    cur.execute('delete from analytics where cacheid=%s', (cacheid,))

    if linkemail:
        devid = database.getDeviceId(cacheid)
        code = database.getLinkCode(devid)
        if database.linkDevice(code, linkemail) == None:
            print('failed to link device')
            exit(1)
        print('linked cacheid %s to email %s' % (cacheid, linkemail))
        print()

    ts = time.time() - 86400 * (30 + random.random())
    msgid = 1
    diff = [0] * (26*2)

    # days
    for _ in range(30):

        # sessions
        for _ in range(10):
            errorRate = .4 + random.random() * .4

            fakemsg({'msg': 'select', 'slot': slot})
            fakemsg({'msg': 'profile-data', 'data': {'levels': diff}})

            # letters
            score = .5
            for _ in range(60):
                L = random.randint(0, 25)
                if sum(diff[:26]) >= 4.5 * 26:
                    L += 26

                if random.random() < errorRate:
                    delta = -.33334
                    score = .5
                else:
                    delta = score
                    score += .1
                    if score > 1:
                        score = 1

                old = diff[L]
                diff[L] += delta
                if diff[L] < 0:
                    diff[L] = 0
                if diff[L] > 5.5:
                    diff[L] = 5.5

                fakemsg({'msg': 'diff_update', 'delta': diff[L] - old})

                ts += 1 + random.random()

            ts += 3600

        ts += 86400

database.db.commit()
