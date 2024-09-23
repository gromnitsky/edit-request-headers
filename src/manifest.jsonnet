function(browser="chrome", debug=true) {
  "manifest_version": 3,
  "name": "Edit Request Headers",
  "description": "Add/Modify/Remove HTTP request headers (like Referer or Cookie) via declarativeNetRequest.",
  "version": "0.0.1",
  "icons": {
    "128": "icon.128.png"
  },
  "permissions": [
    "declarativeNetRequest",
    "storage"
  ] + if (debug && browser != "firefox") then ["declarativeNetRequestFeedback"] else [],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": if browser == "firefox" then {
    "type": "module",
    "scripts": ["service_worker.js"]
  } else {
    "type": "module",
    "service_worker": "service_worker.js"
  },
  "options_page": "options.html",
  [if browser == "firefox" then "browser_specific_settings"]: {
    "gecko": {
      "id": "{a5a53cb1-47dd-4bee-a8d2-c32ea310a244}",
      "strict_min_version": "130.0"
    }
  },
}
