#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <assert.h>

#include <jansson.h>

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

int debug() {
  char *v = getenv("DEBUG");
  return strncmp(v ? v : "", "1", 1) == 0;
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

char* headers_json(struct Header *hdr) {
  if (!hdr) return NULL;
  json_t *obj = json_object(); assert(obj);

  for (struct Header *p = hdr; p; p = p->next) {
    if (p->name)
      json_object_set_new(obj, p->name, json_string(p->value ? p->value : ""));
  }

  char *json_str = json_dumps(obj, JSON_ENCODE_ANY); assert(json_str);
  json_decref(obj);
  return json_str;
}

void print_http_response(struct Header *hdr) {
  printf("HTTP/1.1 %s\r\n", hdr ? "200 OK" : "400 Bad Request");
  printf("Date: Sat, 13 Sep 2025 20:11:00 GMT\r\n"); /* FIXME */

  if (!hdr) return;
  char *json = headers_json(hdr);
  printf("Content-Length: %ld\r\n", strlen(json));
  printf("Content-Type: application/json\r\n");
  printf("\r\n");
  printf("%s", json);
  free(json);
}

void headers_print(struct Header *hdr) { /* DEBUG only */
  if (!hdr) return;
  for (struct Header *p = hdr; p; p = p->next) {
    fprintf(stderr, "name: `%s`, value: `%s`\n", p->name, p->value);
  }
}

int main() {
  struct Header *hdr = headers();
  if (debug()) headers_print(hdr);
  print_http_response(hdr);
  headers_free(&hdr);           /* satisfy valgrind */
}
