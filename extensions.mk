src := $(shell find src -type f | grep -v '\.jsonnet' | grep -v vendor)
src.vendor := $(shell find src -type f | grep vendor)
dest := $(dest) $(patsubst src/%, $(out)/ext/%, $(src)) \
	$(patsubst src/vendor/%, $(out)/ext/vendor/%, $(src.vendor)) \
	$(out)/ext/manifest.json
jsonnet := jsonnet --tla-code 'browser="$(browser)"' --tla-code debug=$(debug)
pkg := $(out)/$(shell $(jsonnet) src/manifest.jsonnet | jq -r '.name+"-"+.version' | tr ' ' _)

$(out)/ext/%: src/%
	@mkdir -p $(dir $@)
	cp $< $@

$(out)/ext/%.json: src/%.jsonnet
	@mkdir -p $(dir $@)
	$(jsonnet) $< -o $@

$(out)/ext/vendor/%.js: src/vendor/%.js
	@mkdir -p $(dir $@)
	./esbuild.js $< > $@

_out/private.pem:
	@mkdir -p $(dir $@)
	openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out $@

-include npm.mk

ifdef dest-exclude
dest := $(filter-out $(dest-exclude),$(dest))
endif

zip: $(pkg).zip
$(pkg).zip: $(dest)
	cd $(dir $<) && zip -qr $(CURDIR)/$@ *

crx: $(pkg).crx
$(pkg).crx: _out/private.pem $(dest)
	google-chrome --pack-extension=$(out)/ext --pack-extension-key=$<
	mv $(out)/ext.crx $(pkg).crx

upload: $(pkg).crx
	scp $< gromnitsky@web.sourceforge.net:/home/user-web/gromnitsky/htdocs/js/chrome/
