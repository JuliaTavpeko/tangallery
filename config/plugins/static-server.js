import fs from 'node:fs';
import path from 'node:path';

import { paths } from '../paths.js';

function serveDirectory(
    server,
    urlPrefix,
    sourceDirectory
) {
    server.middlewares.use(
        urlPrefix,
        (req, res, next) => {
            const requestPath =
                decodeURIComponent(
                    req.url.split('?')[0]
                );

            const relativePath =
                requestPath
                    .replace(
                        new RegExp(
                            `^${urlPrefix}`
                        ),
                        ''
                    )
                    .replace(
                        /^\/+/,
                        ''
                    );

            const filePath =
                path.resolve(
                    sourceDirectory,
                    relativePath
                );

            const normalizedSource =
                path.resolve(
                    sourceDirectory
                );

            if (
                filePath !== normalizedSource &&
                !filePath.startsWith(
                    `${normalizedSource}${path.sep}`
                )
            ) {
                next();

                return;
            }

            if (
                !fs.existsSync(filePath) ||
                !fs.statSync(filePath).isFile()
            ) {
                next();

                return;
            }

            const extension =
                path.extname(
                    filePath
                ).toLowerCase();

            const contentTypes = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.mjs': 'application/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8',

                '.svg': 'image/svg+xml',

                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.webp': 'image/webp',
                '.gif': 'image/gif',
                '.avif': 'image/avif',

                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.otf': 'font/otf',
                '.eot': 'application/vnd.ms-fontobject',

                '.pdf': 'application/pdf',
                '.txt': 'text/plain; charset=utf-8',
                '.xml': 'application/xml; charset=utf-8'
            };

            const contentType =
                contentTypes[
                    extension
                    ];

            if (contentType) {
                res.setHeader(
                    'Content-Type',
                    contentType
                );
            }

            fs.createReadStream(
                filePath
            ).pipe(res);
        }
    );
}

export function staticServer() {
    return {
        name: 'static-server',

        apply: 'serve',

        configureServer(server) {
            console.log('paths.files:', paths.files);
            console.log(
                'swiper:',
                path.join(
                    paths.files,
                    'js/libs/swiper/swiper-bundle.min.js'
                )
            );

            serveDirectory(
                server,
                '/img',
                paths.img
            );

            serveDirectory(
                server,
                '/fonts',
                paths.fonts
            );

            serveDirectory(
                server,
                '/js',
                path.join(
                    paths.files,
                    'js'
                )
            );
        }
    };
}