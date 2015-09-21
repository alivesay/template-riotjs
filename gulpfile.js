var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var riot = require('gulp-riot');
var jade = require('gulp-jade');
var concat = require('gulp-concat');
var bower = require('gulp-bower');
var wiredep = require('wiredep');
var flatten = require('gulp-flatten');
var inject = require('gulp-inject');
var order = require('gulp-order');

try {
    var bowerrc = require('.bowerrc');
} catch (e) {
    bowerrc = {};
};

var config = {
    main: 'src/app.js',
    buildDir: '.tmp/build',
    publicDir: '.tmp/public',
    assetsDir: '.tmp/assets',
    clientDir: 'src/client',
    serverDir: 'src/server'
};

gulp.task('nodemon', function () {
    nodemon({ script : config.main, ext : 'js' });
});

gulp.task('riot', function () {
    return gulp.src(config.clientDir + '/app/**/*.tag')
        .pipe(riot({
            template: 'jade'
        })) 
        .pipe(concat('tags.js'))
        .pipe(gulp.dest(config.buildDir + '/riot'));
});

gulp.task('jade', function () {
    return gulp.src(config.clientDir + '/**/*.jade')
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest(config.publicDir));
});

gulp.task('copyjs', function () {
    return gulp.src([
            config.clientDir + '/**/*.js',
            config.buildDir + '/riot/tags.js'
        ])
        .pipe(concat('client.js'))
        .pipe(gulp.dest(config.publicDir));
});

gulp.task('bower', function () {
    return bower();
});

gulp.task('bowerjs', ['bower'], function () {
    return gulp.src(wiredep().js || [])
        .pipe(gulp.dest(config.publicDir + '/vendor/js'))
});

gulp.task('bowercss', ['bower'], function () {
    return gulp.src(wiredep().css || [])
        .pipe(gulp.dest(config.publicDir + '/vendor/css'))
});

gulp.task('bowerfix', ['bower'], function () {
    // workaround for: https://github.com/zont/gulp-bower/issues/30
    gulp.src(bowerrc.directory + '/bower_components/**/*.css.map')
        .pipe(flatten())
        .pipe(gulp.dest(config.publicDir + '/vendor/css'));

    return gulp.src(bowerrc.directory + './bower_components/**/*.js.map')
        .pipe(flatten())
        .pipe(gulp.dest(config.publicDir + '/vendor/js'));
});

gulp.task('wiredep', ['bowerjs', 'bowercss', 'bowerfix', 'jade'], function () {
    return gulp.src('.tmp/public/index.html')
        .pipe(wiredep.stream({
            fileTypes: {
                html: {
                    replace: {
                        js: function (filePath) {
                            return '<script src="vendor/js/' + filePath.split('/').pop() + '"></script>';
                        },
                        css: function (filePath) {
                            return '<link rel="stylesheet" href="vendor/css/' + filePath.split('/').pop() + '" />';
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(config.publicDir));
});

gulp.task('inject', ['copyjs', 'jade', 'wiredep'], function () {
    var sources = gulp.src([
            '**/*.{js,css}',
            '!vendor/**/*',
        ], { read: false, cwd: config.publicDir })
        .pipe(order([
            '**/*.{js,css}',
            'client.js'
        ]));

    return gulp.src(config.publicDir + '/index.html')
        .pipe(inject(sources, { addRootSlash: false }))
            .pipe(gulp.dest(config.publicDir))

});

gulp.task('build', [
    'jade',
    'riot',
    'copyjs',
    'bower',
    'wiredep',
    'inject'
]);

gulp.task('default', [
    'build',
    'nodemon'
]);