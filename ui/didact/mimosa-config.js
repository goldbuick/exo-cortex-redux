exports.config = {
  "modules": [
    "copy",
    "server",
    "require",
    "minify-js",
    "minify-css",
    "live-reload",
    "bower",
    "less",
    "babel6",
    "import-source"
  ],
  "server": {
    "port": 3001,
    "views": {
      "compileWith": "html",
      "extension": "html"
    },
    "defaultServer": {
      "enabled": true
    }
  },
  "importSource": {
    "copy": [{
      "from": "../_lib",
      "to": "assets"
    }]
  },
  "bower": {
    "copy": {
      "mainOverrides": {
        "crossfilter": [
          "crossfilter.js"
        ]
      },
    }
  },
  "copy": {
  "extensions":
    ["js",  "css", "png", "jpg",
     "jpeg","gif", "html","php",
     "eot", "svg", "ttf", "woff", "woff2",
     "otf", "yaml","kml", "ico",
     "htc", "htm", "json","txt",
     "xml", "xsd", "map", "md",
     "mp4", "apng", "mng", "phtml",
     "volt", "fnt", "model"],
    "exclude":[]
  }
}