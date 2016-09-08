require('any-promise/register/bluebird');
require('any-promise/register')('bluebird', {Promise: require('bluebird')});

var fs = require('fs'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    replace = require('gulp-replace-task'),
    NodeFramework = require('./core/NodeFramework.js');

gulp.remote = require('gulp-remote-src');
gulp.merge = require('merge2');

var config = JSON.parse(fs.readFileSync('bootstrap.json', 'utf8'));
NodeFramework.setConfig(config);
var libraries = NodeFramework.resolveDependencies('dependencies');

var fileIndex,
    file;

var remoteInternalStylesheet = [],
    remoteExternalStylesheet = [],
    localInternalStylesheet = [],
    localExternalStylesheet = [];

var remoteInternalJavascript = [],
    remoteExternalJavascript = [],
    localInternalJavascript = [],
    localExternalJavascript = [];

var localJavascript = [],
    localStylesheet = [],
    remoteStylesheet = [],
    remoteJavascript = [];

for (var libraryIndex in libraries) {
    var library = libraries[libraryIndex];
    var pack = typeof libraries[libraryIndex]['package'] != 'undefined' ? libraries[libraryIndex]['package'] : true;

    if (library.hasOwnProperty('stylesheet')) {
        for (fileIndex in library.stylesheet) {
            file = library.stylesheet[fileIndex];

            if (file.indexOf('//') == -1) {
                if (pack) {
                    localInternalStylesheet.push(file);
                } else {
                    localInternalStylesheet.push(file);
                }
                localStylesheet.push(file);
            } else {
                if (pack) {
                    remoteInternalStylesheet.push(file);
                } else {
                    remoteExternalStylesheet.push(file);
                }
                remoteStylesheet.push(file);
            }
        }
    }

    if (library.hasOwnProperty('javascript')) {
        for (fileIndex in library.javascript) {
            file = library.javascript[fileIndex];

            if (file.indexOf('//') == -1) {
                if (pack) {
                    localInternalJavascript.push(file);
                } else {
                    localExternalJavascript.push(file);
                }
                localJavascript.push(file);
            } else {
                if (pack) {
                    remoteInternalJavascript.push(file);
                } else {
                    remoteExternalJavascript.push(file);
                }
                remoteJavascript.push(file);
            }
        }
    }
}

gulp.task('stylesheet', function () {

    gulp.src(localInternalStylesheet)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('stylesheet-dev.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./build'));

});

gulp.task('development', function () {

    gulp.src('assets/index.html')
        .pipe(replace({
            patterns: [
                {
                    match: /{config}/g,
                    replacement: function () {
                        var DI = config;
                        delete DI.build;

                        return JSON.stringify(DI);
                    }
                },
                {
                    match: /{javascript}/g,
                    replacement: function () {
                        var result = '',
                            uri,
                            resource = [];

                        resource = resource.concat(remoteJavascript);
                        resource = resource.concat(localJavascript);

                        for (var i in resource) {
                            uri = resource[i].replace('https://', '//');
                            uri = uri.replace('http://', '//');

                            result += '<script src="' + uri + '"></script>\n';
                        }

                        return result;
                    }
                },
                {
                    match: /{stylesheet}/g,
                    replacement: function () {
                        var result = '',
                            uri,
                            resource = ['build/stylesheet-dev.css'];

                        resource = resource.concat(remoteStylesheet);

                        for (var i in resource) {
                            uri = resource[i].replace('https://', '//');
                            uri = uri.replace('http://', '//');

                            result += '<link rel="stylesheet" type="text/css" href="' + uri + '">\n';
                        }

                        return result;
                    }
                }
            ]
        }))
        .pipe(rename('index-dev.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('production', function () {

    gulp.merge(gulp.remote(remoteInternalJavascript), gulp.src(localInternalJavascript))
        .pipe(sourcemaps.init())
        .pipe(concat('javascript.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build'));

    gulp.merge(gulp.remote(remoteInternalStylesheet), gulp.src(localInternalStylesheet))
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('stylesheet.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./build'));

    gulp.src('assets/index.html')
        .pipe(replace({
            patterns: [
                {
                    match: /{config}/g,
                    replacement: function () {
                        var DI = config;
                        delete DI.libs;

                        return JSON.stringify(DI);
                    }
                },
                {
                    match: /{javascript}/g,
                    replacement: function () {
                        var result = '',
                            uri,
                            resource = ['build/javascript.js'];

                        resource = resource.concat(remoteExternalJavascript);
                        resource = resource.concat(localExternalJavascript);

                        for (var i in resource) {
                            uri = resource[i].replace('https://', '//');
                            uri = uri.replace('http://', '//');

                            result += '<script src="' + uri + '"></script>\n';
                        }

                        return result;
                    }
                },
                {
                    match: /{stylesheet}/g,
                    replacement: function () {
                        var result = '',
                            uri,
                            resource = ['build/stylesheet.css'];

                        resource = resource.concat(remoteExternalStylesheet);
                        resource = resource.concat(localExternalStylesheet);

                        for (var i in resource) {
                            uri = resource[i].replace('https://', '//');
                            uri = uri.replace('http://', '//');

                            result += '<link rel="stylesheet" type="text/css" href="' + uri + '">\n';
                        }

                        return result;
                    }
                }
            ]
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('build', function () {
    gulp.start(['development', 'production']);
});

gulp.task('watch', function () {
    gulp.watch(localStylesheet, ['stylesheet']);
});