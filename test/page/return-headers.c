#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

struct Header {
  char* name;
  char* value;
  struct Header *next;
};

struct Header* header_init() {
  struct Header *hdr = malloc(sizeof(hdr)); assert(hdr);
  hdr->name = NULL;
  hdr->value = NULL;
  hdr->next = NULL;
  return hdr;
}

int header_line_valid(char *s, int len) {
  if (len < 2) return 0;
  return s[len-2] == '\r' && s[len-1] == '\n';
}

char* substring(char* src, char *c) {
  if ( !(src && c)) return NULL;
  int len = c - src;
  char* dest = malloc(len + 1); assert(dest);
  memcpy(dest, src, len);
  dest[len] = '\0';
  return dest;
}

#define HEADER_LINE_MAX 16*1024
#define HEADERS_SIZE 32*1024

struct Header* headers() {
  char header[HEADER_LINE_MAX+1];
  int header_len, lines = 0, total_headers_size = 0;
  struct Header *hdr, *last = NULL;

  while (fgets(header, HEADER_LINE_MAX+1, stdin)) {
    header_len = strlen(header);
    if (!header_line_valid(header, header_len)) return NULL;

    ++lines;
    if (lines == 1) continue;   /* skip HTTP method line */
    if (header_len == 2) break; /* end of headers */

    total_headers_size += header_len;
    if (total_headers_size > HEADERS_SIZE) return NULL;

    header[header_len-2] = '\0';
    hdr = header_init();

    char *colon = strchr(header, ':'); if (NULL == colon) return NULL;
    hdr->name = substring(header, colon);
    if (header_len - (colon - header) > 4) hdr->value = strdup(colon + 2);

    hdr->next = last;
    last = hdr;
  }

  return last;
}

void headers_print(struct Header *hdr) {
  if (!hdr) return;
  for (struct Header *p = hdr; p; p = p->next) {
    printf("name: `%s`, value: `%s`\n", p->name, p->value);
  }
}

void headers_free(struct Header **hdr) {
  if (NULL == hdr || NULL == *hdr) return;

  struct Header *next = NULL;
  for (struct Header *p = *hdr; p; p = next) {
    next = p->next;
    free(p->name);
    free(p->value);
    free(p);
  }
  *hdr = NULL;
}

int main() {
  struct Header *hdr = headers();
  if (!hdr) {
    printf("400\n");
    return 1;
  }

  headers_print(hdr);
  headers_free(&hdr);           /* satisfy valgrind */
}
