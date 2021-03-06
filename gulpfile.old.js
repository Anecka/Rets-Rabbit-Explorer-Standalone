var gulp = require('gulp'),
    sass = require('gulp-sass'),
    bower = require('gulp-bower'),
    gulpFilter = require('gulp-filter'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    plumber = require('gulp-plumber'),
    rm = require('gulp-rm'),
    watch = require('gulp-watch'),
    notify = require('gulp-notify'),
    connect = require('gulp-connect'),
    templateCache = require('gulp-angular-templatecache'),
    minifyHtml = require('gulp-minify-html'),
    addStream = require('add-stream');

var config = {
    css: {
        sassPath: './public/scss/styles/',
        sassImportPath: './public/scss/imports/',
        destCss: './public/css',
        bootstrapPath: './bower_components/bootstrap-sass/assets/stylesheets/',
        bootstrapAngularPath: './bower_components/angular-bootstrap/',
        walthroughPath: './bower_components/ng-walkthrough/css/',
        fontawesomePath: './bower_components/font-awesome/scss/'
    },
    js: {
        jqueryPath: './bower_components/jquery/dist/',
        bootstrapPath: './bower_components/bootstrap-sass/assets/javascripts/',
        src: './src/v2/',
        angular: {
            files: [
                './bower_components/angular/angular.min.js', 
                './bower_components/angular-ui-router/release/angular-ui-router.min.js',
                './bower_components/angular-animate/angular-animate.min.js',
                './bower_components/rets-rabbit-angular/dist/rets-rabbit-angular.min.js',
                './bower_components/rr-api-explorer/dist/rr-explorer-2.min.js',
                './bower_components/angular-scroll/angular-scroll.min.js',
                './bower_components/angular-bootstrap/ui-bootstrap.min.js',
                './bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                './bower_components/ng-walkthrough/ng-walkthrough.js',
                './bower_components/ng-walkthrough/ng-walkthrough.tap_icons.js',
                './bower_components/ng-disable-scroll/disable-scroll.min.js'
            ],
            dist: './public/js/dist/all-angular.min.js'
        }
    },
    html: {
        src: './templates/v2/**/*.html',
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app.templates',
                root: 'app/',
                standAlone: false
            }
        },
        minify: {
            conditionals: true,
            spare: true,
            empty: true
        }
    }
};

//On Error handler
var onError = function(err) {
    console.log(err);
};

//Install bower components
gulp.task('bower', function() {
    return bower().pipe(gulp.dest('./bower_components'));
});

//Move Font Awesome Icons to public dir
gulp.task('icons-fa', function() { 
    return gulp.src('./bower_components/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('./public/fonts')); 
});

//Move Bootstrap Icons to public dir
gulp.task('icons-bootstrap', function() {
    return gulp.src('./bower_components/bootstrap-sass/assets/fonts/bootstrap/**.*')
        .pipe(gulp.dest('./public/fonts/bootstrap'));
});

//Template Cache
function prepareTemplates() {
	console.log('Starting template cache.');
    var cache = gulp.src(config.html.src)
        .pipe(minifyHtml(config.html.minify))
        .pipe(templateCache(
            config.html.templateCache.file,
            config.html.templateCache.options
        ));
    console.log('Finished template cache');
    return cache;
}

gulp.task('templateCache', function () {
    return gulp.src(config.html.src)
        .pipe(minifyHtml(config.html.minify))
        .pipe(templateCache(
            config.html.templateCache.file,
            config.html.templateCache.options
        ))
        .pipe(connect.reload());
});

//Clean the dist directory
gulp.task('clean:dist', function() {
    return gulp.src('app/dist/**/*', {
            read: false
        })
        .pipe(rm())
});

gulp.task('css-copy-vendor', function () {
    return gulp.src([config.css.bootstrapAngularPath  + '*.css', config.css.walthroughPath + '*.css'])
        .pipe(gulp.dest(config.css.destCss));
});

gulp.task('css-dev', ['css-copy-vendor'], function() {
    return gulp.src([config.css.sassPath + '*.scss']) 
        .pipe(plumber())
        .pipe(sass({ 
                style: 'compressed',
                includePaths: [ config.css.sassImportPath, config.css.bootstrapPath, config.css.fontawesomePath]
            }) 
            .on("error", notify.onError(function(error) { 
                return "Error: " + error.message; 
            })))  
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(config.css.destCss))
        .pipe(connect.reload());
});

gulp.task('css-prod', ['css-copy-vendor'], function() {
    return gulp.src([config.css.sassPath + '*.scss'])
        .pipe(plumber())
        .pipe(sass({
            includePaths:  [ config.css.sassImportPath, config.css.bootstrapPath, config.css.fontawesomePath]
        }).on('error', sass.logError))
        .pipe(minifyCss({
            processImport: false,
            benchmark: true,
            keepSpecialComments: 0
        }))
        .pipe(concat('styles.min.css'))
        .pipe(gulp.dest(config.css.destCss))
        .pipe(connect.reload());
});

//Compile all angular sources to be used in the js compilation tasks
gulp.task('angular', function() {
    return gulp.src(config.js.angular.files)
        .pipe(plumber())
        .pipe(concat('all-angular.min.js'))
        .pipe(gulp.dest('./public/js/dist'));
});

gulp.task('js-dev', ['clean:dist', 'angular'], function() {
    return gulp.src([config.js.jqueryPath + 'jquery.min.js', config.js.bootstrapPath + 'bootstrap.min.js', config.js.angular.dist, './src/v2/**/*.js'])
        .pipe(plumber())
        .pipe(addStream.obj(prepareTemplates()))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/js/'))
        .pipe(connect.reload());
});

gulp.task('js-prod', ['clean:dist', 'angular'], function() {
    return gulp.src([config.js.jqueryPath + 'jquery.min.js', config.js.bootstrapPath + 'bootstrap.min.js', config.js.angular.dist, './src/v2/**/*.js'])
        .pipe(plumber())
        .pipe(addStream.obj(prepareTemplates()))
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./public/js/'))
        .pipe(connect.reload());
});

//Watch all sources to recompile
gulp.task('watch', function() { 
    //Sass that we write in /styles dir
    gulp.watch(config.css.sassPath + '*.scss', {
        interval: 500
    }, ['css-dev', 'css-prod']); 

    //Sass that we write in /imports dir
    gulp.watch(config.css.sassImportsPath + '*.scss', {
        interval: 500
    }, ['css-dev', 'css-prod']); 

    //Recompile all js for dev
    gulp.watch(config.js.src + '**/*.js', {
        interval: 500
    }, ['js-dev']);

    //Reload server on template change
    gulp.watch(config.html.src, {
    	interval: 500
    }, ['templateCache']);
});

gulp.task('default', ['server', 'bower', 'icons-fa', 'icons-bootstrap', 'css-dev', 'css-prod', 'js-dev', 'js-prod', 'watch']);
