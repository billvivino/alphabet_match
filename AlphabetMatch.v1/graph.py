import os, math, time, json, string, tempfile, hashlib
from subprocess import Popen

HASHSECRET = '2\x84\x7f~Ð\x0c&ÝÙW\xa04CÎTc'
GRAPHDIR = 'public/graphs'
CACHETIME = 3600  # one hour
USECACHE = True

os.makedirs(GRAPHDIR, exist_ok=True)


def gnuplot(filename, cmd, data):
    if not data:
        if os.path.exists(filename):
            os.remove(filename)
        return
    
    fd, datafile = tempfile.mkstemp(text=True)
    df = open(fd, 'w')
    for row in data:
        df.write(' '.join(map(str, row)) + '\n')
    df.close()
    
    out = open(filename, 'wb')
    p = Popen(['gnuplot', '-e', cmd.replace('$DATA', '"%s"' % datafile)], stdout=out)
    r = p.wait()
    out.close()
    os.remove(datafile)

    if r != 0:
        os.remove(filename)
        raise Exception('gnuplot error')

def datefromts(ts):
    return time.strftime('%Y-%m-%d', time.localtime(ts))


class Record:
    def __init__(self, **kwargs):
        for name, value in kwargs.items():
            setattr(self, name, value)

class Plotter:
    def __init__(self, email, sessions, segment, cache=USECACHE):
        self.email = email
        self.sessions = sessions
        self.segment = segment
        self.cache = cache

    def makefilename(self, name):
        'return (path, url)'
        h = hashlib.sha1((HASHSECRET + ':' + self.email).encode('utf8')).hexdigest()
        d = os.path.join(GRAPHDIR, h)
        os.makedirs(d, exist_ok=True)
        fn = os.path.join(d, self.getsegmentprefix() + name)
        return fn, fn.split('/', 1)[-1]

    def getsegmentprefix(self):
        if not self.segment:
            return ''
        d = json.dumps(self.segment, sort_keys=True)
        return hashlib.sha1(d.encode('utf8')).hexdigest() + '_'

    def plot(self, name, cmd, data):
        path, url = self.makefilename(name)
        gnuplot(path, cmd, data)
        return url

    def make(self):
        cachefile, _ = self.makefilename('cache.json')
        if self.cache:
            if os.path.exists(cachefile) and time.time() - os.stat(cachefile).st_mtime < CACHETIME:
                with open(cachefile, 'r') as f:
                    return json.load(f)

        graphs = []
        graphs.append(self.graph_sessions())
        graphs.append(self.graph_difficulty())
        graphs += self.graph_correct()
        graphs.append(self.graph_responsetime())
        graphs.append(self.graph_goalchecks())
        graphs.append(self.table_problemletters())

        with open(cachefile, 'w') as f:
            json.dump(graphs, f)

        return graphs

    def segmentMatchSession(self, session):
        if 'slot' in self.segment:
            assert session[0][1]['msg'] == 'select'
            slot = session[0][1]['slot']
            if slot != self.segment['slot']:
                return False
        return True

    def graph_sessions(self):
        bydate = {}
        for session in self.sessions:
            if self.segmentMatchSession(session):
                dur = (session[-1][0] - session[0][0]) / 60
                
                d = datefromts(session[0][0])
                if d not in bydate:
                    bydate[d] = 0
                bydate[d] += dur

        data = []
        for d in sorted(bydate):
            data.append((d, bydate[d]))

        # set terminal png size 1024,768
        url = self.plot('sessions.png', '''
        set terminal png;
        set key off;
        set xlabel "date";
        set ylabel "minutes of playtime";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        set yrange [0:];
        plot $DATA using 1:2 with linespoints;
        ''', data)

        return {
            'title': 'Total Playtime',
            'segment': self.segment,
            'url': url,
        }

    def graph_difficulty(self):
        bydate = {}
        for session in self.sessions:
            if not self.segmentMatchSession(session):
                continue

            diff = 0
            lst = []
            for ts, msg in session:
                if msg['msg'] == 'profile-data':
                    if 'levels' in msg['data']:
                        diff = sum(msg['data']['levels'])
                    else:
                        diff = 0
                    lst.append(diff)
                elif msg['msg'] == 'diff_update':
                    diff += msg['delta']
                    lst.append(diff)

            if not lst:
                continue

            lstmin = min(lst)
            lstmax = max(lst)
            
            d = datefromts(session[0][0])
            if d not in bydate:
                bydate[d] = (None, None, None, None, None, None)
            opn, close, small, large, opntime, closetime = bydate[d]
            if opn == None or opntime > session[0][0]:
                opn = lst[0]
                opntime = session[0][0]
            if close == None or closetime < session[-1][0]:
                close = lst[-1]
                closetime = session[-1][0]
            if small == None or small > lstmin:
                small = lstmin
            if large == None or large < lstmax:
                large = lstmax
            bydate[d] = (opn, close, small, large, opntime, closetime)

        data = []
        for d in sorted(bydate):
            u, v, w, x, y, z = bydate[d]
            u /= 26
            v /= 26
            w /= 26
            x /= 26
            data.append((d, u, v, w, x, y, z))

        url = self.plot('difficulty.png', '''
        set terminal png;
        set key off;
        set xlabel "date";
        set ylabel "average difficulty";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        set boxwidth 86400;
        set yrange [0:];
        plot $DATA using 1:2:4:5:3 with candlesticks whiskerbars .5;
        ''', data)

        return {
            'title': 'Difficulty Progress',
            'segment': self.segment,
            'url': url,
        }

    def graph_correct(self):
        bydate = {}
        for session in self.sessions:
            if self.segmentMatchSession(session):
                total = correct = 0
                goal = None
                options = []
                for ts, msg in session:
                    if msg['msg'] == 'newletter':
                        goal = msg['goal']
                        options = msg['choices'].lower().split()
                    elif msg['msg'] == 'pick':
                        total += 1
                        assert msg['letter'] in options, '%r not in %r' % (msg['letter'], options)
                        if msg['letter'] == goal:
                            correct += 1

                d = datefromts(session[0][0])
                if d not in bydate:
                    bydate[d] = Record(correct=0, total=0)
                bydate[d].correct += correct
                bydate[d].total += total

        data = []
        for d in sorted(bydate):
            correct, total = bydate[d].correct, bydate[d].total
            data.append((d, correct, total, correct / total if total else 0))

        url = self.plot('correct.png', '''
        set terminal png;
        set key off;
        set xlabel "date";
        set ylabel "percentage correct";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        set yrange [0:1];
        plot $DATA using 1:4 with linespoints;
        ''', data)

        url2 = self.plot('correctcount.png', '''
        set terminal png;
        set xlabel "date";
        set ylabel "answers";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        set yrange [0:];
        plot $DATA using 1:3 with linespoints title 'total answers', '' using 1:2 with linespoints title 'correct answers', '' using 1:($3-$2) with linespoints title 'incorrect answers';
        ''', data)

        return [{
            'title': 'Correct Answers',
            'segment': self.segment,
            'url': url,
        }, {
            'title': 'Answer Count',
            'segment': self.segment,
            'url': url2,
        }]

    def graph_responsetime(self, onlycorrect=False):
        bydate = {}
        for session in self.sessions:
            if self.segmentMatchSession(session):
                times = []
                goal = None
                start = None
                for ts, msg in session:
                    if msg['msg'] == 'newletter':
                        goal = msg['goal']
                        start = ts
                    elif msg['msg'] == 'pick':
                        if start != None and (not onlycorrect or msg['letter'] == goal):
                            times.append(ts - start)
                            start = None

                d = datefromts(session[0][0])
                if d not in bydate:
                    bydate[d] = []
                bydate[d] += times

        data = []
        for d in sorted(bydate):
            times = bydate[d]
            if len(times) > 0:
                times.sort()
                i = math.floor(len(times) / 3)
                k = math.floor(len(times) * 2/3)
                dmin, d1, d2, dmax = times[0], times[i], times[k], times[-1]
                data.append((d, dmin, d1, d2, dmax))

        url = self.plot('responsetime%s.png' % ('_correct' if onlycorrect else ''), '''
        set terminal png;
        set key off;
        set xlabel "date";
        set ylabel "response time (sec)";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        set boxwidth 86400;
        set yrange [0:60];
        plot $DATA using 1:3:2:5:4 with candlesticks whiskerbars .5;
        ''', data)

        return {
            'title': 'Response Time' + (' (Correct only)' if onlycorrect else ''),
            'desc': 'Time from when new letters are first shown to %s. Box indicates central third of data.' % ('touching the first goal letter' if onlycorrect else 'first letter touch, regardless of correctness'),
            'segment': self.segment,
            'url': url,
        }

    def graph_goalchecks(self):
        bydate = {}
        for session in self.sessions:
            if self.segmentMatchSession(session):
                goalcheck = 0
                cloudtouch = 0
                cloudclear = 0
                for ts, msg in session:
                    if msg['msg'] == 'goalcheck':
                        goalcheck += 1
                    elif msg['msg'] == 'cloudtouch':
                        cloudtouch += 1
                    elif msg['msg'] == 'cloudclear':
                        cloudclear += 1

                d = datefromts(session[0][0])
                if d not in bydate:
                    bydate[d] = Record(goalcheck=0, cloudtouch=0, cloudclear=0)
                bydate[d].goalcheck += goalcheck
                bydate[d].cloudtouch += cloudtouch
                bydate[d].cloudclear += cloudclear

        data = []
        for d in sorted(bydate):
            counts = bydate[d]
            data.append((d, counts.goalcheck, counts.cloudtouch, counts.cloudclear))

        url = self.plot('goalcheck.png', '''
        set terminal png;
        set xlabel "date";
        set ylabel "touch count";
        set xdata time;
        set format x "%m/%d";
        set timefmt "%Y-%m-%d";
        plot $DATA using 1:2 with linespoints title 'Goal Checks', '' using 1:3 with linespoints title 'Cloud Touches', '' using 1:4 with linespoints title 'Cloud Clears';
        ''', data)

        return {
            'title': 'Goal and Cloud Touches',
            'desc': '',
            'segment': self.segment,
            'url': url,
        }

    def table_problemletters(self):
        problems = {}  # {letter: (wins, losses)}
        confused = {}  # {letter: {wrongletter: count}}

        for letter in string.ascii_lowercase + string.ascii_uppercase:
            problems[letter] = (0, 0)
            confused[letter] = {}

        for session in self.sessions:
            if self.segmentMatchSession(session):
                goal = None
                choices = None

                def add():
                    if goal != None:
                        W, L = problems.get(goal, (0, 0))
                        if win: W += 1
                        else: L += 1
                        problems[goal] = (W, L)
                        for w in wrong:
                            confused[goal][w] = confused[goal].get(w, 0) + 1

                for ts, msg in session:
                    if msg['msg'] == 'newletter':
                        add()
                        goal = msg['choices'][msg['choices'].lower().index(msg['goal'])]
                        choices = msg['choices'].split()
                        wrong = set()
                        win = True
                    elif msg['msg'] == 'pick':
                        if goal != None and choices[msg['box']] != goal:
                            win = False
                            wrong.add(choices[msg['box']])
                add()

        rows = [['letter', 'success', 'frequent incorrect answers']]
        def keyfunc(t):
            W, L = problems[t]
            if W + L == 0: return 0
            return -W / (W + L)
        for goal in sorted(problems, key=keyfunc):
            W, L = problems[goal]
            if W + L == 0:
                percent = 0
            else:
                percent = math.floor(100 * W / (W + L))

            conf = []
            for a, c in sorted(confused[goal].items(), key=lambda t: (-t[1], t[0])):
                if len(conf) < 3 or c == conf[-1][1]:
                    conf.append((a, c))

            rows.append([
                goal,
                '%d%% in %d trial%s' % (percent, W + L, 's' if W + L != 1 else ''),
                ', '.join('%s<sup>%d</sup>' % (a, c) for a, c in conf),
            ])

        return {
            'table': rows,
            'header': True,
            #'html': json.dumps(bydate),
        }
