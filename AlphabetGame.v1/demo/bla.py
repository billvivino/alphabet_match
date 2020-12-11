import os

i = 1
for f in sorted(os.listdir('.')):
    if f.startswith('screenshot'):
        os.system('convert "%s" -crop 958x627+0+161 %02d.png' % (f, i))
        i += 1
