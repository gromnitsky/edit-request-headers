# make crx
# watchthis.sound -e src/flycheck_\* -e _out -- make browser=firefox

$(if $(MAKE_RESTARTS), $(info RESTARTING MAKE))

browser := chrome
debug := true
export out := _out/$(shell git rev-parse --abbrev-ref HEAD)/$(browser)

all:

npm.src := node_modules/plain-dialogs/index.mjs
include extensions.mk

$(out)/ext/icon.128.png: src/icon.svg
	inkscape $< -o $@ -w 128 -h 128

dest := $(filter-out %.svg, $(dest)) $(out)/ext/icon.128.png

$(out)/ext/vendor/inireader.js: node_modules/inireader/index.js
	@mkdir -p $(dir $@)
	./esbuild.js $< > $@

dest += $(out)/ext/vendor/inireader.js

all: $(dest)

.PHONY: test
test: $(dest); node_modules/.bin/mocha -u tdd test/test_* $(o)
