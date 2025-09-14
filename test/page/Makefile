# dnf install jansson-devel

http-echo-headers:

CFLAGS := -Ivendor/jansson/_out/include \
	-g -Wall -Werror -std=c23 -fstack-protector-strong -fPIE -pie
LDFLAGS := -static -Lvendor/jansson/_out/lib -ljansson \
	-z noexecstack -z relro -z now

%: %.c vendor/jansson/_out/lib/libjansson.a
	$(CC) $(CFLAGS) $< $(LDFLAGS) -o $@

vendor/jansson/_out/lib/libjansson.a:
	mkdir -p vendor
	cd vendor && git clone --depth=1 https://github.com/akheron/jansson
	cd vendor/jansson && autoreconf -i
	cd vendor/jansson && ./configure --enable-shared=no --prefix=`pwd`/_out
	cd vendor/jansson && make install

%.valgrind: %
	valgrind --leak-check=full ./$* < get2.txt
