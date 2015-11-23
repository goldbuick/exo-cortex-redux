exports.config = {
  "modules": [
    "copy",
    "server",
    "jshint",
    "csslint",
    "require",
    "minify-js",
    "minify-css",
    "live-reload",
    "bower",
    "less",
    "react",
    "babel",
    "import-source"
  ],
  "server": {
    "port": 3000,
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
  "react": {
    "extensions": ["jsx"],
    "options": {
      "harmony": true,
      "sourceMap": true
    }
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
  "babel": {
    "extensions": ["jsx"],
    "options": {
      "modules": "amd"
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
     "volt", "fnt"],
    "exclude":[]
  }
}