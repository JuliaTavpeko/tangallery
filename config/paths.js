import path from 'node:path';

const root = process.cwd();

export const paths = {
    root,

    src: path.resolve(
        root,
        'src'
    ),

    build: path.resolve(
        root,
        'build'
    ),

    assets: path.resolve(
        root,
        'src/assets'
    ),

    fonts: path.resolve(
        root,
        'src/assets/fonts'
    ),

    icons: path.resolve(
        root,
        'src/assets/icons'
    ),

    files: path.resolve(
        root,
        'src/assets/files'
    ),

    img: path.resolve(
        root,
        'src/img'
    ),

    scss: path.resolve(
        root,
        'src/scss'
    ),

    js: path.resolve(
        root,
        'src/js'
    ),

    components: path.resolve(
        root,
        'src/components'
    ),

    layouts: path.resolve(
        root,
        'src/layouts'
    ),

    buildFonts: path.resolve(
        root,
        'build/fonts'
    ),

    buildImg: path.resolve(
        root,
        'build/img'
    ),

    buildSprites: path.resolve(
        root,
        'build/img/sprites'
    ),

    buildCss: path.resolve(
        root,
        'build/css'
    ),

    buildJs: path.resolve(
        root,
        'build/js'
    )
};