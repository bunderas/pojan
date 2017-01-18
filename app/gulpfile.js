(function() {
    "use strict";
    var argv = require('yargs').argv,
        fs = require('fs'),
        insert = require('gulp-insert'),
        browserSync = require('browser-sync'),
        cache = require('gulp-cached'),
        changed = require('gulp-changed'),
        del = require('del'),
        extend = require('extend'),
        gulp = require('gulp'),
        server = require('gulp-express'),
        concat = require('gulp-concat'),
        babel = require('gulp-babel'),
        //babelpolyfill = require('babel-polyfill'),
        gfilter = require('gulp-filter'),
        gulpif = require('gulp-if'),
        imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant'),
        uglify = require('gulp-uglify'),
        jshint = require('gulp-jshint'),
        //stylish = require('jshint-stylish'),
        less = require('gulp-less'),
        csso = require('gulp-csso'),
        //newer = require('gulp-newer'),
        path = require('path'),
        plumber = require('gulp-plumber'),
        runSequence = require('run-sequence'),
        size = require('gulp-size'),
        using = require('gulp-using'),
        util = require('gulp-util'),
        through = require('through2'),
        dateFormat = require('dateformat'),
        stripDebug = require('gulp-strip-debug'),
        working_dir = __dirname.split(path.sep).pop(),
        /*******************************/
        dev = false,
        now = new Date(),
        timeHash = (now.getTime()).toString(36),
        formatedDate = dateFormat(now, "yyyy-mm-dd"),
        staticDir = argv.dir ? argv.dir : 'static',
        /********************************/
        paths = {
            src: {
                root: 'client'
            },
            dist: {
                root: '../public_html',
                static: '/' + staticDir
            }
        };

    extend(true, paths.src, {
        js: [paths.src.root + '/scripts/**/*.js'],
        less: paths.src.root + '/styles/**/*.less',
        images: paths.src.root + '/images/**/*.{jpg,gif,png,svg,ico,xml,json}',
        fonts: paths.src.root + '/fonts/**/*',
        json: paths.src.root + '/json/*'
    });
    extend(true, paths.dist, {
        js: paths.dist.root + paths.dist.static + '/js',
        css: paths.dist.root + paths.dist.static + '/css',
        images: paths.dist.root + paths.dist.static + '/img',
        fonts: paths.dist.root + paths.dist.static + '/font',
        json: paths.dist.root + paths.dist.static + '/json'
    });
    gulp.task('clean', function() {
        /*del.sync([
            paths.dist.root + '/**', '!' + paths.dist.root
        ]);*/
    });
    gulp.task('fonts', function() {
        var fileContent = fs.readFileSync(paths.src.root + '/styles/fonts.less', "utf8");
        fileContent = fileContent.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:\/\/(?:.*)$)/gm, "");
        return gulp.src(paths.src.fonts)
            .pipe(changed(paths.dist.fonts))
            .pipe(plumber())
            .pipe(through.obj(function(file, enc, callback) {
            var filename = file.path.split(/[\/|\\]/).pop().split('.')[0];
            if (fileContent.indexOf(filename) !== -1) {
                this.push(file);
            } else {
                console.log('Skip font: ', filename);
            }
            callback();
        })).pipe(using()).pipe(size({
            showFiles: true,
            title: 'fonts'
        })).pipe(gulp.dest(paths.dist.fonts));
    });
    gulp.task('json', function() {
        return gulp.src(paths.src.json).pipe(changed(paths.dist.json)).pipe(plumber()).pipe(using()).pipe(size({
            showFiles: true,
            title: 'json'
        }))
            .pipe(gulp.dest(paths.dist.json));
    });
    gulp.task('js', function() {
        return gulp.src(paths.src.js)
            .pipe(plumber())
            //.pipe(cache('linting'))
            //.pipe(jshint())
            //.pipe(jshint.reporter(stylish))
            .pipe(gulpif(!dev, stripDebug()))
            /*.pipe(babel({
                plugins: [
                    //'transform-runtime',
                    'transform-es2015-template-literals',
                    'transform-es2015-block-scoping'
                ],
                presets: ['es2015']
            }))*/
            .pipe(size({
                showFiles: true,
                title: 'js'
            }))
            .pipe(concat('common.js'))
            .pipe(gulpif(!dev, uglify({preserveComments:'license'})))
            .pipe(size({
                showFiles: true,
                title: 'js minify'
            }))
            .pipe(gulp.dest(paths.dist.js)).on('error', util.log);
    });
    gulp.task('clean:after', function() {
        del.sync([
            paths.dist.root + paths.dist.static + '/css/**/*.css',
            paths.dist.root + '/**/*.{css,js,map}',
            //paths.dist.root + '/html',
            '!' + paths.dist.root + '/**/common.{js,css,map}',
            paths.dist.root + paths.dist.static + '/js/lib',
            //'!' + paths.dist.root + paths.dist.static + '/js/lib/jquery/jquery.min.js'
        ]);
    });
    gulp.task('less', function() {
        var filter = gfilter(['**/common.less']);
        return gulp.src(paths.src.less)
            .pipe(plumber(function(error) {
                console.log('\x1b[31m', error.message, '\x1b[0m');
                browserSync.notify(error.message, 4000);
            })).pipe(filter)
            /*.pipe(gulpif(dev, changed(paths.dist.root, {
                extension: '.css'
            })))*/
            .pipe(using())
            .pipe(less())
            .pipe(csso())
            .pipe(size({
                showFiles: true,
                title: 'less'
            }))
            .pipe(gulp.dest(paths.dist.css))
            .pipe(browserSync.stream()).on('error', util.log);
    });

    gulp.task('images', function() {
        var svgfilter = gfilter('**/*.svg', {
            restore: true
        });
        return gulp.src(paths.src.images)
            .pipe(plumber())
            .pipe(gulpif(!dev, imagemin({
                progressive: true,
                //optimizationLevel: 4,
                svgoPlugins: [{
                    removeViewBox: false
                }],
                use: [pngquant({
                    quality: '70-90',
                    speed: 1
                })]
            })))
            //.pipe(changed(paths.dist.images))
            .pipe(size({
                showFiles: true,
                title: 'images'
            })).pipe(gulp.dest(paths.dist.images));
    });

    gulp.task('timestamp', function() {
        var str = '/* Generated: ' + formatedDate + ' #' + timeHash + '*/ \n';
        return gulp.src(paths.dist.root + '/**/*.{css,js}').pipe(plumber()).pipe(insert.prepend(str)).pipe(gulp.dest(paths.dist.root));
    });

    gulp.task('browser-sync', function() {
        browserSync({
            proxy: "http://localhost:3000",
            port: 5000,
            host: working_dir,
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: true
            },
            notify: true
        });
    });

    gulp.task('bs-reload', function() {
        browserSync.reload();
    });

    gulp.task('watch', function() {
        gulp.watch([paths.src.fonts], ['fonts']);
        gulp.watch([paths.src.images], ['images']);
        gulp.watch([paths.src.less], ['less']);
        gulp.watch([paths.src.js], ['js', 'bs-reload']);
        gulp.watch(['app/server/**/*.{marko,js,json}'], ['express-reload', 'bs-reload']);
    });

    gulp.task('express', function () {
        server.run(['app/server/index.js']);
    });

    gulp.task('express-reload', function () {
        server.run();
    });

    gulp.task('express-notify', function () {
        server.notify();
    });

    gulp.task('build', function() {
        dev = false;
        runSequence('clean', ['fonts', 'images', 'json', 'js', 'less' ], 'timestamp');
    });

    gulp.task('default', function() {
        dev = true;
        // runSequence('express','clean', ['fonts', 'images', 'json', 'js', 'less' ], 'timestamp', 'watch','browser-sync');
        runSequence('clean', ['fonts', 'images', 'json', 'js', 'less' ], 'timestamp', 'watch','browser-sync');
    });

})()