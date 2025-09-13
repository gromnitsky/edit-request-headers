# dnf install jansson-devel

libs := jansson
CFLAGS := $(shell pkg-config --cflags $(libs)) -g -Wall -Werror -std=c23
LDFLAGS := $(shell pkg-config --libs $(libs))

%.valgrind: %
	valgrind --leak-check=full ./$* < get2.txt
