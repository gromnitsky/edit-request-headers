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

int header_valid(char *s, ssize_t len) {
  if (len < 2) return 0;
  return s[len-2] == '\r' && s[len-1] == '\n';
}

char* substring(char* src, char c) {
  if (!src) return NULL;
  char* end = strchr(src, c); if (!end) return NULL;
  size_t len = end - src;
  char* dest = malloc(len + 1); assert(dest);
  memcpy(dest, src, len);
  dest[len] = '\0';
  return dest;
}

struct Header* headers() {
  char *header = NULL;
  size_t dummy = 0;
  ssize_t header_len;
  int total_headers_size = 0;
  int lines = 0;
  struct Header *hdr, *last = NULL;

  while ( (header_len = getline(&header, &dummy, stdin)) != -1) {
    if (!header_valid(header, header_len)) return NULL;

    ++lines;
    if (lines == 1) continue;   /* skip HTTP method line */
    if (header_len == 2) break; /* end of headers */

    fprintf(stderr, "line %d (%c)\n", lines, header[0]);

    total_headers_size += header_len;
    if (total_headers_size > 32*1024) return NULL;

    header[header_len-2] = '\0';
    hdr = header_init();

    hdr->name = substring(header, ':'); if (NULL == hdr->name) return NULL;
    char *colon = strchr(header, ':');
    if (header_len - (colon - header) > 4) hdr->value = strdup(colon + 2);

    hdr->next = last;
    last = hdr;
  }

  free(header);
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
