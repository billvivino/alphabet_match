import re

with open('config.xml', 'r') as f:
    xml = f.read()

def repl(m):
    return '%s="%d"' % (m.group(1), int(m.group(2)) + 1)

xml = re.sub(r'(android-versionCode)="(\d+)"', repl, xml)
xml = re.sub(r'(ios-CFBundleVersion)="(\d+)"', repl, xml)

with open('config.xml', 'w') as f:
    f.write(xml)
