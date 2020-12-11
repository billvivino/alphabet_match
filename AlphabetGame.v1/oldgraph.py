
MODE = 'nice'

# case
UPPER = 1
LOWER = 2
MIXED = (UPPER | LOWER)

# difficulty
EASY = 0
MEDIUM = 1
HARD = 2

imageid = 0

twocell = '<table><tr><td>%s</td><td>%s</td></tr></table>'

def nextimageid():
    global imageid
    imageid += 1
    return imageid

class Game:
    def __init__(self):
        self.rounds = []
        self.case = 0
        
        # start, finish, difficulty, case
        self.difficulty = EASY
        self.case = UPPER

    @property
    def date(self):
        return time.strftime('%Y-%m-%d at %H:%M:%S', time.localtime(self.start))

    def show(self, out):
        #level = '%s level, %s case' % ({EASY: 'easy', MEDIUM: 'medium', HARD: 'hard'}[self.difficulty], {UPPER: 'upper', LOWER: 'lower', MIXED: 'mixed'}[self.case])
        level = ''
        roundsummary = ' '.join(map(str, self.rounds))

        fn = '%03d.png' % nextimageid()

        durs = []
        for r in self.rounds:
            durs.append(r.finish - r.start)

        color = {EASY: '#00bb00', MEDIUM: 'orange', HARD: '#bb0000'}[self.difficulty]
        
        gnuplot(GRAPHDIR + '/' + fn, '''
        set terminal png size 250,250;
        set style data histogram;
        set style fill solid;
        set key off;
        unset xtics;
        plot [] [%f:%f] "$DATA";
        ''' % (0, 60),
            [[f] for i, f in enumerate(durs)])

        if not hasattr(self, 'finish'):
            self.finish = self.rounds[-1].finish

        out.write(twocell % (
            '<img src="%s">' % fn,
            '%s <br> %s <br> %s <br><br> %s <br><br> errors: %d <br> %.1f minutes' % (self.player, self.date, level, roundsummary, roundsummary.count('!'), (self.finish - self.start) / 60)
        ))

def playerSummary(games, out):
    lst = []
    for game in games:
        durs = []
        for r in game.rounds:
            durs.append(r.finish - r.start)

        dmin = dmax = None
        davg = 0
        for d in durs:
            if dmin == None or d < dmin:
                dmin = d
            if dmax == None or d > dmax:
                dmax = d
            davg += d
        davg /= len(durs)
        lst.append((dmin, davg, dmax))

    fn = '%03d.png' % nextimageid()
    gnuplot(GRAPHDIR + '/' + fn, '''
    set terminal png size 250,250;
    set style data linespoints;
    set style histogram rowstacked;
    set style fill solid;
    set key off;
    unset xtics;
    plot "$DATA" using 1, '' using 2, '' using 3;
    ''', lst)

    out.write(twocell % (
        '<img src="%s">' % fn,
        'round time metrics grouped by game: <br> max <br> average <br> min',
    ))

class Round:
    def __init__(self, letter):
        self.letter = letter
        self.incorrect = 0
        self.total = 0
        self.goalcheck = 0
        self.log = []

        # start, finish

    def __str__(self):
        return ''.join(self.log)

def analyze(data):
    games = []
    game = None
    player = None
    
    for e in data:
        msg = e['msg']
        
        if msg == 'adhoc':
            player = e['name']
            game = None

        elif (msg == 'backout' and e['screen'] == 'Game') or (msg == 'changescreen' and e['dest'] == 'Victory'):
            if game:
                game.finish = e['ts']
                game = None
            player = None

        elif msg == 'newletter':
            if not game:
                game = Game()
                game.player = player
                game.start = e['ts']
                games.append(game)
            if len(game.rounds) > 0:
                game.rounds[-1].finish = e['ts']

            r = Round(e['goal'])
            game.rounds.append(r)

            r.log.append('[%s]' % r.letter)
            r.start = e['ts']
            r.finish = e['ts']

        elif msg == 'setgroup' and game:
            game.finish = e['ts']
            game = None

        elif msg == 'pick' and game:
            goal = e['letter']
            r = game.rounds[-1]
            if len(game.rounds) > 0:
                r.finish = e['ts']
            
            if goal == r.letter:
                r.log.append(goal)
                r.total += 1

                # guess case of this game
                c = ord(goal)
                if c >= ord('A') and c <= ord('Z'):
                    game.case |= UPPER
                elif c >= ord('a') and c <= ord('z'):
                    game.case |= LOWER

            else:
                r.log.append('!') #'(!%s)' % info[2])
                r.total += 1
                r.incorrect += 1

        elif msg == 'goalcheck':
            r = game.rounds[-1]
            r.log.append('?')
            r.goalcheck += 1

    # remove empty games
    #for i in reversed(range(len(games))):
    #    if not games[i].rounds:
    #        games.pop(i)

    return games

def jsonloadmany(f):
    data = []
    for line in f:
        data += json.loads(line)

    # sort by ts
    data.sort(key=lambda e: e['ts'])

    # remove dups
    for i in reversed(range(len(data) - 1)):
        if data[i]['ts'] == data[i + 1]['ts']:
            del data[i]

    return data

def dateToUnixTime(d):
    return time.mktime(time.strptime(d, '%Y-%m-%d'))

def main():
    files = sorted(glob.glob('analytics/dover/*'))
    files.remove('analytics/dover/2018-04-18-b087ba3d2e4dcd90d9918dd78fb35376')

    games = []
    for fn in files:
        print(fn)
        data = jsonloadmany(open(fn, 'r'))
        games += analyze(data)
    print()
    games.sort(key=lambda g: g.date)

    print('graphing...')

    out = open(GRAPHDIR + '/analytics.html', 'w')
    
    dates = set(game.date[:10] for game in games)
    players = set(game.player or '' for game in games)

    gamesbydate = {}
    for date in dates:
        glist = [g for g in games if g.date[:10] == date]
        glist.sort(key=lambda g: g.player or '')
        gamesbydate[date] = glist

    if MODE == 'verbose':
        for date, glist in sorted(gamesbydate.items()):
            out.write('<h2>%s</h2>' % (date,))
            for game in glist:
                game.show(out)

    elif MODE == 'nice':
        data = []
        for date, glist in sorted(gamesbydate.items()):
            #out.write('<h2>%s</h2>' % (date,))

            dur = wrong = total = 0
            for game in glist:
                for r in game.rounds:
                    d = r.finish - r.start
                    if d < 3600:  # an hour
                        dur += d
                    wrong += r.incorrect
                    total += r.total
            data.append((date, dur, wrong, total))
            #out.write('duration: %d <br>' % dur)
            #out.write('wrong: %d <br>' % wrong)
            #out.write('total: %d <br>' % total)

        out.write('<p>Horizontal axis is time from %s to %s.' % (min(dates), max(dates)))

        out.write('<style> .graph { float: left; padding: 20px; } </style>')
        
        gnuplot(GRAPHDIR + '/duration.png', '''
        set terminal png size 400,300;
        set style data linespoints;
        set style histogram rowstacked;
        set style fill solid;
        set key off;
        unset xtics;
        plot "$DATA" using 1:2;
        ''', [(dateToUnixTime(t[0]), t[1] / 3600) for t in data])
        out.write('<div class="graph"><p>Total duration of round time (hours): <p><img src="duration.png"></div>')

        gnuplot(GRAPHDIR + '/correct.png', '''
        set terminal png size 400,300;
        set style data linespoints;
        set style histogram rowstacked;
        set style fill solid;
        set key off;
        unset xtics;
        plot [] [] "$DATA" using 1:2, '' using 1:3;
        ''', [(dateToUnixTime(t[0]), t[2], t[3]) for t in data])
        out.write('<div class="graph"><p>Total answers vs. incorrect answers: <p><img src="correct.png"></div>')

        gnuplot(GRAPHDIR + '/correct2.png', '''
        set terminal png size 400,300;
        set style data linespoints;
        set style histogram rowstacked;
        set style fill solid;
        set key off;
        unset xtics;
        plot [] [] "$DATA" using 1:2;
        ''', [(dateToUnixTime(t[0]), 100 * ((t[3] - t[2]) / t[3] if t[3] else 1)) for t in data])
        out.write('<div class="graph"><p>Percentage correct: <p><img src="correct2.png"></div>')

        gnuplot(GRAPHDIR + '/peranswer.png', '''
        set terminal png size 400,300;
        set style data linespoints;
        set style histogram rowstacked;
        set style fill solid;
        set key off;
        unset xtics;
        plot [] [0:20] "$DATA" using 1:2;
        ''', [(dateToUnixTime(t[0]), t[1] / t[3] if t[3] else 0) for t in data])
        out.write('<div class="graph"><p>Time per answer (seconds): <p><img src="peranswer.png"></div>')

    else:
        raise Exception('invalid mode: ' + str(mode))

    out.close()
    if os.path.exists('data.tmp'):
        os.remove('data.tmp')

#main()
