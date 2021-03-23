const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    });
}

function scripts() {
    return src([
            'app/js/main.js',
            'node_modules/fullpage.js/vendors/scrolloverflow.js',
            'node_modules/fullpage.js/dist/fullpage.js'
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src([
            'app/scss/style.scss',
            'node_modules/fullpage.js/dist/fullpage.css'
        ])
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function images() {
    return src('app/images/**/*.{jpg,png,svg,gif,ico,webp}')
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}


function cleanDist() {
    return del('dist')
}

function build() {
    return src([
            'app/css/style.min.css',
            'app/fonts/**/*.{woff,woff2}',
            'app/js/main.min.js',
            'app/**/*.html',
        ], {
            base: 'app'
        })
        .pipe(dest('dist'))
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.cleanDist = cleanDist;
exports.images = images;


exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, browsersync, scripts, watching);
