# dnf install jansson-devel

http-echo-headers:

ifndef debug
LDFLAGS_DEBUG := -static
endif
CFLAGS := -g -Ivendor/jansson/_out/include \
	 -Wall -Werror -std=c23 -fstack-protector-strong -fPIE -pie
LDFLAGS := $(LDFLAGS_DEBUG) -Lvendor/jansson/_out/lib -ljansson \
	-z noexecstack -z relro -z now

%: %.c vendor/jansson/_out/lib/libjansson.a
	$(CC) $(CFLAGS) $< $(LDFLAGS) -o $@

vendor/jansson/_out/lib/libjansson.a:
	mkdir -p vendor
	cd vendor && git clone --depth=1 https://github.com/akheron/jansson
	cd vendor/jansson && autoreconf -i
	cd vendor/jansson && ./configure --prefix=`pwd`/_out
	cd vendor/jansson && make install

%.valgrind: %
	valgrind --leak-check=full ./$* < get2.txt

tcplol:
	tcplol -v -p 1234 ./http-echo-headers

upload: http-echo-headers index.html http-echo-headers.socket http-echo-headers@.service
	rsync -Pa --delete http-echo-headers index.html alex@sigwait.org:/home/alex/apps/http-echo-headers/ $(o)
	rsync -Pa --delete http-echo-headers.socket http-echo-headers@.service alex@sigwait.org:/home/alex/.config/systemd/user/ $(o)
