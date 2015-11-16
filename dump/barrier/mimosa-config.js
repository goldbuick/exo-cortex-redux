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
    "web-package"
  ],
  "server": {
    "port": 8080,
    "views": {
      "compileWith": "html",
      "extension": "html"
    }
  },
  "react": {
    "lib": undefined,
    "extensions": ["jsx"],
    "options": {
      "harmony": true,
      "sourceMap": true
    }
  },
  "babel": {
    "extensions": ["jsx"],
    "options": {
      "modules": "amd"
    }
  },
  "bower": {
    "copy": {
      "mainOverrides": {
        "crossfilter": [
          "crossfilter.js"
        ]
      }
    }
  }
}
