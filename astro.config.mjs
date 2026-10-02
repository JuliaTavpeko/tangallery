import fs from 'node:fs';
import path from 'node:path';

import { defineConfig } from 'astro/config';

import { paths } from './config/paths.js';

import { staticServer } from './config/plugins/static-server.js';
import { svgSprite } from './config/plugins/svg-sprite.js';
import { processStyles } from './config/plugins/process-styles.js';
import { processScripts } from './config/plugins/process-scripts.js';
import { processImages } from './config/plugins/process-images.js';
import { copyAssets } from './config/plugins/copy-assets.js';
import { pictureHtml } from './config/plugins/picture-html.js';


function rootPages() {
    return {
        name: 'root-pages',

        hooks: {
            'astro:config:setup': ({
                                       injectRoute
                                   }) => {
                if (!fs.existsSync(paths.src)) {
                    return;
                }

                const files = fs.readdirSync(
                    paths.src,
                    {
                        withFileTypes: true
                    }
                );

                for (const entry of files) {
                    if (
                        !entry.isFile() ||
                        !entry.name.endsWith('.astro')
                    ) {
                        continue;
                    }

                    const name = path.basename(
                        entry.name,
                        '.astro'
                    );

                    const pattern =
                        name === 'index'
                            ? '/'
                            : `/${name}`;

                    injectRoute({
                        pattern,
                        entrypoint: path.join(
                            paths.src,
                            entry.name
                        ),
                        prerender: true
                    });
                }
            }
        }
    };
}


function devHtmlLinks() {
    return {
        name: 'dev-html-links',

        apply: 'serve',

        configureServer(server) {
            server.middlewares.use(
                (req, res, next) => {
                    if (
                        !req.url ||
                        req.url.includes('?') ||
                        !req.url.endsWith('.html')
                    ) {
                        next();

                        return;
                    }

                    const pathname =
                        req.url.replace(
                            /\.html$/,
                            ''
                        );

                    req.url =
                        pathname || '/';

                    next();
                }
            );
        }
    };
}


function cleanupAstroFiles() {
    return {
        name: 'cleanup-astro-files',

        hooks: {
            'astro:build:done': () => {
                const directories = [
                    path.join(
                        paths.build,
                        '_astro'
                    ),

                    path.join(
                        paths.build,
                        '.prerender'
                    )
                ];

                for (const directory of directories) {
                    if (!fs.existsSync(directory)) {
                        continue;
                    }

                    fs.rmSync(
                        directory,
                        {
                            recursive: true,
                            force: true
                        }
                    );
                }
            }
        }
    };
}


export default defineConfig({
    outDir: paths.build,

    output: 'static',

    devToolbar: {
        enabled: false
    },

    build: {
        format: 'file',

        inlineStylesheets: 'never'
    },

    vite: {
        css: {
            devSourcemap: true
        },

        resolve: {
            alias: {
                '/src/fonts': paths.fonts
            }
        },

        plugins: [
            devHtmlLinks(),

            staticServer(),
            svgSprite(),
            processStyles(),
            processScripts(),
            processImages(),
            copyAssets()
        ]
    },

    integrations: [
        rootPages(),
        pictureHtml(),
        cleanupAstroFiles()
    ]
});