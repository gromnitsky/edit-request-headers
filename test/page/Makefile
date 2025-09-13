# dnf install jansson-devel

libs := jansson
CFLAGS := $(shell pkg-config --cflags $(libs)) -g -Wall -Werror -std=c23 -fstack-protector-strong -fPIE -pie
LDFLAGS := $(shell pkg-config --libs $(libs)) -z noexecstack -z relro -z now

%.valgrind: %
	valgrind --leak-check=full ./$* < get2.txt
