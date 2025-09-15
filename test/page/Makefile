# 'release' build is static
http-echo-headers:

src := $(dir $(realpath $(lastword $(MAKEFILE_LIST))))
usr := $(src)/_out/usr
vendor := _out/vendor

LDFLAGS_DEBUG := $(if $(debug),,-static)
CFLAGS := -g -I$(usr)/include \
	 -Wall -Werror -std=c23 -fstack-protector-strong -fPIE -pie
LDFLAGS := $(LDFLAGS_DEBUG) -L$(usr)/lib -ljansson \
	-z noexecstack -z relro -z now

%: %.c $(usr)/lib/libjansson.a
	$(CC) $(CFLAGS) $< $(LDFLAGS) -o $@

$(usr)/lib/libjansson.a:
	rm -rf $(vendor)/jansson; mkdir -p $(vendor)
	git clone --depth=1 https://github.com/akheron/jansson $(vendor)/jansson
	cd $(vendor)/jansson && autoreconf -i -W none
	cd $(vendor)/jansson && ./configure -q --enable-silent-rules --prefix=$(usr)
	cd $(vendor)/jansson && make --no-print-directory install

%.valgrind: %; valgrind --leak-check=full ./$* < get2.txt
tcplol: http-echo-headers; tcplol -v -p 1234 ./$<

upload: rsync-program rsync-systemd

rsync-program: http-echo-headers index.html
	rsync -Pa --delete $^ alex@sigwait.org:/home/alex/apps/http-echo-headers/ $(o)
rsync-systemd: http-echo-headers.socket http-echo-headers@.service
	rsync -Pa --delete $^ alex@sigwait.org:/home/alex/.config/systemd/user/ $(o)
