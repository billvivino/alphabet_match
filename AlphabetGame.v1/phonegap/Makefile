
COMMONSOURCE = ../public/common
SOURCE = ../public/alphabet
DEST = www
ZIPFILE = matching2.zip

.PHONY: all copyfiles zipfiles

all: copyfiles zipfiles

copyfiles:
	python bump-version.py
	rm -rf $(DEST)/*.html $(DEST)/*.js $(DEST)/*.css $(DEST)/images $(DEST)/sounds $(DEST)/fonts $(DEST)/common

	cp -r $(SOURCE)/*.html $(SOURCE)/*.js $(SOURCE)/*.css $(SOURCE)/images $(SOURCE)/sounds $(SOURCE)/fonts $(DEST)/

	mkdir $(DEST)/common
	cp -r $(COMMONSOURCE)/*.js $(DEST)/common/
	cp siteconf.js $(DEST)/common/
	sed -E -i 's:../common/:common/:g' $(DEST)/*.html

zipfiles:
	rm -f $(ZIPFILE)
	zip -qr $(ZIPFILE) config.xml www
