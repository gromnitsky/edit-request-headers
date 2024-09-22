A browser extension (manifest v3) to add, modify, or remove HTTP
request headers (such as Referer or Cookie) using the
declarativeNetRequest API.

Upon installation, you'll see an options page resembling an INI-file
editor:

<img src='screenshot.options.png' alt=''>

Each INI section corresponds to a separate *rule*. The section name
serves as a simple *URL filter*, which can be:

* a domain name, like `example.com`;
* a domain name with a pathname, like `example.com/foo`.

Subdomains will be matched as well (e.g., `www.example.com`). To disable
this, prefix the domain with `https://`.

Each key-value pair corresponds to a header name and its desired
value. If the value is empty, the header will be removed from the
request.

## License

MIT
