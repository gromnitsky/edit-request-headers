# make crx
# watchthis.sound -e src/flycheck_\* -e _out -- make browser=firefox

$(if $(MAKE_RESTARTS), $(info RESTARTING MAKE))

browser := chrome
debug := true
export out := _out/$(shell git rev-parse --abbrev-ref HEAD)/$(browser)

all:

npm.src := node_modules/plain-dialogs/index.mjs
include extensions.mk

$(out)/ext/inireader.js: node_modules/inireader/index.js
	./esbuild.js $< > $@

dest += $(out)/ext/inireader.js

all: $(dest)

.PHONY: test
test: $(dest); node_modules/.bin/mocha -u tdd test/test_* $(o)
