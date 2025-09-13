CFLAGS := -g -Wall -Werror -std=c23

%.valgrind: %
	valgrind --leak-check=full ./$* < get2.txt
