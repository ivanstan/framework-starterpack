require('any-promise/register/bluebird');
require('any-promise/register')('bluebird', {Promise: require('bluebird')});

var fs = require('fs'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    inject = require('gulp-inject'),
    replace = require('gulp-replace-task'),
    packageJson = require('./package.json'),
    NodeFramework = require('./core/NodeFramework.js'),
    sourceJs = [],
    sourceScss = [];

var config = JSON.parse(fs.readFileSync('bootstrap.json', 'utf8'));
NodeFramework.setConfig(config);
var libs = NodeFramework.resolveDependencies('dependencies');

for (var i in libs) {

    if (libs[i].hasOwnProperty('scss')) {
        sourceScss = sourceScss.concat(libs[i].scss);
    }

    if (libs[i].hasOwnProperty('js')) {
        sourceJs = sourceJs.concat(libs[i].js);
    }
}

gulp.task('styles', function () {
    gulp.src(sourceScss)
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('styles.css'))
        .pipe(cleanCSS())
        .pipe(gulp.dest('./assets'));
});

gulp.task('js', function () {
    gulp.src(sourceJs)
        .pipe(concat('javascript.js'))
        .pipe(gulp.dest('./assets'));
});

gulp.task('development', function () {

    gulp.src('assets/index.html')
        .pipe(inject(gulp.src(sourceJs.concat(['assets/styles.css']), {read: false}), {
            relative: false,
            addRootSlash: false
        }))
        .pipe(replace({
            patterns: [
                {
                    match: /{bootstrap.json}/g,
                    replacement: function () {
                        var DI = config;
                        delete DI.libs;

                        return JSON.stringify(DI);
                    }
                }
            ]
        }))
        .pipe(rename('index-dev.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('production', function () {

    gulp.src('assets/index.html')
        .pipe(inject(gulp.src(['build/frontend-framework-1.0.0.js', 'assets/javascript.js', 'assets/styles.css'], {read: false}), {
            relative: false,
            addRootSlash: false
        }))
        .pipe(replace({
            patterns: [
                {
                    match: /{bootstrap.json}/g,
                    replacement: function () {
                        var DI = config;
                        delete DI.libs;

                        return JSON.stringify(DI);
                    }
                }
            ]
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('build', function () {
    gulp.start(['styles', 'js', 'development', 'production']);
});

gulp.task('watch', function () {
    gulp.watch(sourceScss, ['styles']);
});