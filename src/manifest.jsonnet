function(browser="chrome") {
    "manifest_version": 3,
    "name": "Edit Request Headers",
    "version": "0.0.1",
    "permissions": [
      "declarativeNetRequest",
      "declarativeNetRequestFeedback",
      "storage"
    ],
    "host_permissions": [
      "<all_urls>"
    ],
    "background": {
        "type": "module",
        "scripts": ["service_worker.js"]
    }
}
