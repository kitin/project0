/* Paths variables */
var basepath = {
	src: 'src/',
	dest: 'htdocs/',
};
var path = {
    build: {
        js: basepath.dest + 'js/',
        css: basepath.dest + 'css/',
        img: basepath.dest + 'i/',
        fonts: basepath.dest + 'fonts/'
    },
    src: {
        js: basepath.src + 'scripts/',
        pug: basepath.src +  '*.pug',
        css: basepath.src + 'scss/*.scss',
        img: basepath.src + 'images/**/*.*',
        fonts: basepath.src + 'fonts/*'
    },
    watch: {
        pug: basepath.src + '**/*.pug',
        js: basepath.src + 'scripts/**/*.js',
        css: basepath.src + 'scss/**/*.scss',
        img: basepath.src + 'images/**/*.*',
        fonts: basepath.src + 'fonts/*.*'
    },
    sprite: {
        src: basepath.src + '/images/svgSprite/*.svg',
        svg: 'i/sprite.svg',
        css: '../../' + basepath.src + 'scss/src/utils/_sprite.scss'
    }
};

/*
	Let the magic begin
*/
var gulp = require('gulp'),
	browserSync = require('browser-sync').create(), 
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    prefixer = require('gulp-autoprefixer'),
    plumber = require("gulp-plumber"), 
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    reload = browserSync.reload;

var $ = {
	gutil: require('gulp-util'),
	svgSprite: require('gulp-svg-sprite'),
	svg2png: require('gulp-svg2png'),
	size: require('gulp-size')
}


/* Pug templates */
gulp.task('pug', function(){
    return gulp.src(path.src.pug)
        .pipe(plumber())
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(basepath.dest))
        .pipe(reload({stream: true}));
});


/* Sass */
gulp.task('sass', function() {
    return gulp.src(path.src.css)
    	.pipe(plumber())
        .pipe(sass.sync())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

/* JS */
gulp.task('vendorjs', function() {
    return gulp.src(path.src.js+"vendor/*.js")
        .pipe(uglify())
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('userjs', function() {
    return gulp.src(path.src.js+"*.js")
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});


/* Images */
gulp.task('images', function () {
    return gulp.src([path.src.img, '!src/images/svgSprite/*.*']) 
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

/* Fonts */
gulp.task('fonts', function() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


/* SVG Sprite */
var changeEvent = function(evt) {
	$.gutil.log('File', $.gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basepath.src + ')/'), '')), 'was', $.gutil.colors.magenta(evt.type));
};

gulp.task('svgSprite', function () {
	return gulp.src(path.sprite.src)
        .pipe(plumber())
		.pipe($.svgSprite({
			shape: {
				spacing: {
					padding: 5
				}
			},
			mode: {
				css: {
					dest: "./",
					layout: "diagonal",
					sprite: path.sprite.svg,
					bust: false,
					render: {
						scss: {
							dest: "../src/scss/utils/_sprite.scss",
							template: "src/scss/utils/sprite-template.scss"
						}
					}
				}
			},
			variables: {
				mapname: "icons"
			}
		}))
		.pipe(gulp.dest(basepath.dest))
        .pipe(browserSync.stream());
});

gulp.task('pngSprite', ['svgSprite'], function() {
	return gulp.src(basepath.dest + path.sprite.svg)
		.pipe($.svg2png())
		.pipe($.size({
			showFiles: true
		}))
		.pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('sprite', ['pngSprite']);


// server
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: {
            baseDir: basepath.dest
        },
        notify: false,
    });

    gulp.watch(path.watch.pug, ['pug']);
    gulp.watch([path.watch.css, '!src/scss/utils/*.*'], ['sass']);
    gulp.watch(path.watch.js, ['vendorjs', 'userjs']);
    gulp.watch(path.watch.images, ['images']);
    gulp.watch(path.watch.fonts, ['fonts']);
    //gulp.watch("htdocs/*.html").on('change', browserSync.reload);
	gulp.watch(path.sprite.src, ['sprite']).on('change', function(evt) {
		changeEvent(evt);
	});
});


// default actions
gulp.task('default', ['serve']);