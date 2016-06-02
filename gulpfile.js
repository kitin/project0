/* Paths variables */
var basepath = {
	src: 'src/',
	dest: 'htdocs/',
};
var path = {
    build: {
        js: basepath.dest + 'js/',
        css: basepath.dest + 'css/',
        img: basepath.dest + 'i/'
    },
    src: {
        js: basepath.src + 'scripts/[^_]*.js',
        pug: basepath.src +  '*.pug',
        css: basepath.src + 'scss/*.scss',
        img: basepath.src + 'images/**/*.*',
    },
    watch: {
        pug: basepath.src + '**/*.pug',
        js: basepath.src + 'scripts/**/*.js',
        css: basepath.src + 'scss/**/*.*',
        img: basepath.src + 'images/**/*.*',
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
    watch = require('gulp-watch');

var $ = {
	gutil: require('gulp-util'),
	svgSprite: require('gulp-svg-sprite'),
	svg2png: require('gulp-svg2png'),
	size: require('gulp-size'),
}


/* Pug templates */
gulp.task('pug', function(){
  gulp.src(path.src.pug)
    .pipe(plumber())
    .pipe(pug({
        pretty: true
    }))
    .pipe(gulp.dest('./htdocs/'))
    .pipe(browserSync.stream());
});


/* Sass */
gulp.task('sass', function() {
    return gulp.src(path.src.css)
    	.pipe(plumber())
        .pipe(sass.sync())
        .pipe(gulp.dest(path.build.css))
        .pipe(browserSync.stream());
});

// JS
gulp.task('js', function () {
    gulp.src(path.src.js) 
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
});

// Images
gulp.task('images', function () {
    gulp.src([path.src.img, '!src/images/svgSprite/*.*']) 
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
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
        .pipe(browserSync.stream());
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

    gulp.watch(path.src.pug, ['pug']);
    gulp.watch(path.src.css, ['sass']);
    gulp.watch(path.src.img, ['images']);
    //gulp.watch("htdocs/*.html").on('change', browserSync.reload);
    watch([path.watch.js], function(event, cb) {
        gulp.start('js');
    });
	gulp.watch(path.sprite.src, ['sprite']).on('change', function(evt) {
		changeEvent(evt);
	});
});


// default actions
gulp.task('default', ['serve']);