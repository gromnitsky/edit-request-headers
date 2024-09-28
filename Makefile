# make crx
# watchthis.sound -e src/flycheck_\* -e _out -- make browser=firefox

$(if $(MAKE_RESTARTS), $(info RESTARTING MAKE))

browser := chrome
debug := true
export out := _out/$(shell git rev-parse --abbrev-ref HEAD)/$(browser)

all:

dest := $(out)/ext/icon.128.png
dest-exclude := %/icon.svg
npm.src := node_modules/plain-dialogs/index.mjs
include extensions.mk

$(out)/ext/icon.128.png: src/icon.svg
	@mkdir -p $(dir $@)
	inkscape $< -o $@ -w 128 -h 128

$(out)/ext/editor.js: src/editor.js
	@mkdir -p $(dir $@)
	./esbuild.js $< > $@

all: $(dest)

.PHONY: test
test: $(dest); node_modules/.bin/mocha -u tdd test/test_* $(o)

upload-test:
	rsync -avPL --delete -e ssh test/page/ gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/edit-request-headers-test/
