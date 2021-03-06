"use strict" /* jshint esversion: 6 */; // For JShint // For JShint // Settings
/* jshint node: true */ const coloring = true, // on/off coloring of logs
  voice = true, // on/off voice action
  notifies = false, // on/off notifications
  preprocHTML = "pug", // HTML preprocessor
  preprocCSS = "scss", // CSS preprocessor
  usePHP = false, // on/off using PHP
  serverPHP = "site:81"; // PHP server domain

// Colors
const reset = "\x1b[0m",
  black = "\x1b[30m",
  red = "\x1b[31m",
  green = "\x1b[32m",
  yellow = "\x1b[33m",
  blue = "\x1b[34m",
  magenta = "\x1b[35m",
  cyan = "\x1b[36m",
  white = "\x1b[37m";

// Libraries
const { src, dest, parallel, series } = require("gulp"),
  browserSync = require("browser-sync").create(), // Live server
  reload = browserSync.reload, // Reloading server
  bowerFiles = require("main-bower-files"), // Parsing bower packages
  watch = require("gulp-watch"), // Watching files
  pug = require("gulp-pug"), // PUG
  rename = require("gulp-rename"), // Renaming files
  sass = require("gulp-sass"), // SCSS
  prefixer = require("gulp-autoprefixer"), // Autoprefixer
  sourcemaps = require("gulp-sourcemaps"), // Generate sourcemaps
  cleanCSS = require("gulp-clean-css"), // CSS minimize
  uglify = require("gulp-uglify"), // JS minimize
  imagemin = require("gulp-imagemin"), // Img minimize
  changed = require("gulp-changed"), // Parsing newer files (code)
  newer = require("gulp-newer"), // Parsing newer files (images)
  rimraf = require("rimraf"), // Clean
  gulpif = require("gulp-if"), // 'If' in .pipe
  fs = require("fs-extra"), // Create files
  notify = require("gulp-notify"), // Notifications
  say = require("say"); // Voice action

// Path's
const path = {
  vendor: {
    // Bower packages
    js: "app/js/",
    css: "app/css/",
  },
  dist: {
    // Build files
    html: "./",
    php: "./",
    js: "./js/",
    scss: "./css/",
    css: "./css/",
    img: "./img/",
    fonts: "./fonts/",
  },
  app: {
    // Development files
    pug: "app/**/*.pug",
    html: "app/**/*.html",
    php: "app/**/*.php",
    js: "app/js/*.js",
    scss: "app/css/*.scss",
    css: "app/css/*.css",
    img: "app/img/**/*.*",
    fonts: "app/fonts/**/*.*",
  },
  watch: {
    // Files for watching
    pug: "app/**/*.pug",
    html: "app/**/*.html",
    php: "app/**/*.php",
    js: "app/js/**/*.js",
    scss: "app/css/**/*.scss",
    css: "app/css/**/*.css",
    img: "app/img/**/*.*",
    fonts: "app/fonts/**/*.*",
  },
  clean: "./dist", // Files for cleaning
};

const config = {
  // Initializing the browser-sync package
  server: {
    // Server directory
    baseDir: "./",
  },
  logPrefix: "antogor", // Server name
  online: true, // Work in online / offline
  ghostMode: false, // Displaying actions on all devices
};

function color(code) {
  // Coloring of logs
  if (coloring) console.log(code);
}

function speak(message) {
  // Voice action
  if (voice) say.speak(message);
}

function notice(message) {
  // Notifications
  if (notifies) notify(message);
}

function server() {
  // Server
  color(cyan); // Coloring logs
  if (!usePHP) {
    browserSync.init(
      // Starting server
      config
    );
  } else {
    browserSync.init(
      // Starting server
      config,
      {
        proxy: serverPHP,
      }
    );
  }
  notice("Server started"); // Notification
  speak("server started"); // Voice
}

function vendorCSS() {
  return src(bowerFiles("**/*.css")) // Take vendor files
    .pipe(changed(path.vendor.css)) // Select newer files
    .pipe(dest(path.vendor.css)); // Drop in dev
}

function vendorJS() {
  return src(bowerFiles("**/*.js")) // Take vendor files
    .pipe(changed(path.vendor.js)) // Select newer files
    .pipe(dest(path.vendor.js)); // Drop in dev
}

function build_PUG() {
  return src(path.app.pug) // Take PUG files
    .pipe(
      gulpif(
        usePHP, // Select newer files
        changed(path.dist.html, { extension: ".php" }),
        changed(path.dist.html, { extension: ".html" })
      )
    )
    .pipe(
      pug({
        // Convert in HTML
        pretty: false,
      })
    )

    .on("error", function () {
      // At error
      color(red); // Coloring logs
      notice("Invalid PUG"); // Notification
      speak("Invalid PUG"); // Voice
    })
    .on("error", console.log) // Log error
    .on("error", function () {
      color(reset); // Reset color logs
    })

    .pipe(
      gulpif(
        usePHP, // Renaming to PHP files
        rename({ extname: ".php" })
      )
    )
    .pipe(dest(path.dist.html)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_HTML() {
  return src(path.app.html) // Take HTML files
    .pipe(
      gulpif(
        usePHP, // Select newer files
        changed(path.dist.html, { extension: ".php" }),
        changed(path.dist.html, { extension: ".html" })
      )
    )
    .pipe(
      gulpif(
        usePHP, // Renaming to PHP files
        rename({ extname: ".php" })
      )
    )
    .pipe(dest(path.dist.html)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_PHP() {
  return src(path.app.php) // Take HTML files
    .pipe(
      changed(
        // Select newer files
        path.dist.html,
        { extension: ".php" }
      )
    )
    .pipe(dest(path.dist.php)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_SCSS() {
  return src(path.app.scss) // Take SCSS files
    .pipe(
      changed(path.dist.css, {
        // Select newer files
        extension: ".css",
      })
    )
    .pipe(sourcemaps.init()) // Initializing sourcemaps
    .pipe(sass()) // Convert in CSS

    .on("error", function () {
      // At error
      color(red); // Coloring logs
      notice("Invalid SCSS"); // Notification
      speak("Invalid SCSS"); // Voice
    })
    .on("error", console.log) // Log error
    .on("error", function () {
      color(reset); // Reset color logs
    })

    .pipe(
      prefixer({
        // Add prefixes
        overfideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(
      cleanCSS({
        // Minimize CSS
        level: {
          1: {
            specialComments: 0,
          },
        },
      })
    )
    .pipe(sourcemaps.write()) // Add sourcemaps
    .pipe(dest(path.dist.css)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_CSS() {
  return src(path.app.css) // Take SCSS files
    .pipe(changed(path.dist.css)) // Select newer files
    .pipe(sourcemaps.init()) // Initializing sourcemaps
    .pipe(
      prefixer({
        // Add prefixes
        overfideBrowserslist: ["last 10 versions"],
        grid: true,
      })
    )
    .pipe(
      cleanCSS({
        // Minimize CSS
        level: {
          1: {
            specialComments: 0,
          },
        },
      })
    )
    .pipe(sourcemaps.write()) // Add sourcemaps
    .pipe(dest(path.dist.css)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_JS() {
  return src(path.app.js) // Take JS files
    .pipe(changed(path.dist.js)) // Select newer files
    .pipe(sourcemaps.init()) // Initializing sourcemaps
    .pipe(uglify()) // Minimize JS
    .pipe(sourcemaps.write()) // Add sourcemaps
    .pipe(dest(path.dist.js)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_img() {
  return src(path.app.img) // Take img files
    .pipe(newer(path.dist.img)) // Select newer files
    .pipe(
      imagemin({
        // Minimize img
        progressive: true,
        svgoPlugins: [
          {
            removeViewBox: false,
          },
        ],
        interlaced: true,
      })
    )
    .pipe(dest(path.dist.img)) // Drop in build
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function build_fonts() {
  return src(path.app.fonts) // Take fonts files
    .pipe(newer(path.dist.fonts)) // Select newer files
    .pipe(
      reload({
        // Reload server
        stream: true,
      })
    );
}

function watching() {
  watch([path.watch.pug], function (event, cb) {
    console.log(magenta, "~ Logged changes to PUG files ~", reset);
    build_PUG();
  });
  watch([path.watch.html], function (event, cb) {
    console.log(magenta, "~ Logged changes to HTML files ~", reset);
    build_HTML();
  });
  watch([path.watch.php], function (event, cb) {
    console.log(magenta, "~ Logged changes to PHP files ~", reset);
    build_PHP();
  });
  watch([path.watch.scss], function (event, cb) {
    console.log(magenta, "~ Logged changes to SCSS files ~", reset);
    build_SCSS();
  });
  watch([path.watch.css], function (event, cb) {
    console.log(magenta, "~ Logged changes to CSS files ~", reset);
    build_CSS();
  });
  watch([path.watch.js], function (event, cb) {
    console.log(magenta, "~ Logged changes to JS files ~", reset);
    build_JS();
  });
  watch([path.watch.img], function (event, cb) {
    console.log(magenta, "~ Logged changes to img files ~", reset);
    build_img();
  });
  watch([path.watch.fonts], function (event, cb) {
    console.log(magenta, "~ Logged changes to fonts files ~", reset);
    build_fonts();
  });
}

function directory() {
  return src("*.*", {
    read: false,
  })
    .pipe(dest("./app"))
    .pipe(dest("./app/css"))
    .pipe(gulpif(usePHP, dest(".app/php")))
    .pipe(dest("./app/js"))
    .pipe(dest("./app/img"))
    .pipe(dest("./app/fonts"));
}

function files() {
  fs.writeFile(
    "./app/index.pug",
    '-var title = ""\n-var description = ""\n-var keywords = ""\n-var og_img = "img/"\n-var url = "https:\u002F\u002F"\n\ndoctype html\nhtml(lang="ru")\n	head\n		\u002F\u002F- About document\n		meta(charset="UTF-8")\n		meta(name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0")\n		meta(name="description" content=description)\n		meta(name="keywords" content=keywords)\n		title= title\n		\u002F\u002F- Icons\n		link(rel="icon" href="img/ico.ico")\n		link(rel="shortcut icon" href="img/ico.ico")\n		\u002F\u002F- OG\n		meta(property="og:title" content=title)\n		meta(property="og:type" content="website")\n		meta(property="og:image" content=og_img)\n		meta(property="og:url" content=url)\n		meta(property="og:description" content=description)\n		\u002F\u002F- Styles\n		link(rel="stylesheet" href="css/main.css")\n	body\n		\n		script(src="js/main.js")'
  );
  fs.writeFile("./app/css/main.scss", "");
  fs.writeFile(
    "./app/css/media.scss",
    "@media screen and (max-width: 991px) {\n	\n}\n"
  );
  fs.writeFile("./app/js/main.js", "$(document).ready(function(){\n	\n});");
  notice("Files created");
  console.log(magenta, "~ Files created ~", reset);
}

function clean(cb) {
  rimraf(path.clean, cb);
  console.log(magenta, "~ Build removed ~", reset);
}

function help() {
  var helps = {
    gulp: "Start default task",
    "gulp build": "Build a project",
    "gulp server": "Start live server",
    "gulp project": "Deploy template project",
    "gulp clean": "Remove build project",
    "gulp help": "Show info about commands",
    "gulp watching": "Start watching files",
    "gulp vendorJS": "Drop bower JS files in project",
    "gulp vendorCSS": "Drop bower CSS files in project",
    "gulp build:PUG": "Build PUG files",
    "gulp build:HTML": "Build HTML files",
    "gulp build:PHP": "Build PHP files",
    "gulp build:SCSS": "Build SCSS files",
    "gulp build:CSS": "Build CSS files",
    "gulp build:JS": "Build JS files",
    "gulp build:img": "Build img files",
    "gulp build:fonts": "Build fonts files",
  };
  for (var i in helps) {
    console.log(yellow, i, white, "\t- " + helps[i], reset);
  }
}

exports.help = help; // Task write help
exports.vendorCSS = vendorCSS; // Task moving vendor CSS
exports.vendorJS = vendorJS; // Task moving vendor JS
exports["build:PUG"] = build_PUG; // Task build PUG
exports["build:HTML"] = build_HTML; // Task build HTML
exports["build:PHP"] = build_PHP; // Task build HTML
exports["build:SCSS"] = build_SCSS; // Task build SCSS
exports["build:CSS"] = build_CSS; // Task build CSS
exports["build:JS"] = build_JS; // Task build JS
exports["build:img"] = build_img; // Task build img
exports["build:fonts"] = build_fonts; // Task build fonts
exports.server = server; // Task start server
exports.watching = watching;
exports.project = series(directory, files);
exports.clean = clean; // Task remove build
exports.build = series(
  // Task build
  parallel(vendorCSS, vendorJS),
  parallel(
    build_PUG,
    build_HTML,
    build_PHP,
    build_SCSS,
    build_CSS,
    build_JS,
    build_img,
    build_fonts
  )
);
exports.default = series(
  series(
    parallel(vendorCSS, vendorJS),
    parallel(
      build_PUG,
      build_HTML,
      build_PHP,
      build_SCSS,
      build_CSS,
      build_JS,
      build_img,
      build_fonts
    )
  ),
  parallel(server, watching)
);
