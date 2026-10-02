import fs from 'node:fs';
import path from 'node:path';

import * as esbuild from 'esbuild';

import { paths } from '../paths.js';

const isRawBuild =
    process.env.JS_BUILD_MODE === 'raw';

function getJsFiles(directory) {
    const files = [];

    if (!fs.existsSync(directory)) {
        return files;
    }

    for (const entry of fs.readdirSync(
        directory,
        {
            withFileTypes: true
        }
    )) {
        const fullPath = path.join(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {
            files.push(
                ...getJsFiles(fullPath)
            );

            continue;
        }

        if (
            entry.isFile() &&
            entry.name.endsWith('.js') &&
            !entry.name.endsWith('.min.js')
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function getRelativeJsPath(file) {
    return path.relative(
        paths.js,
        file
    );
}

function getOutputPath(file) {
    return path.join(
        paths.buildJs,
        getRelativeJsPath(file)
    );
}

function getMinOutputPath(file) {
    const relative = getRelativeJsPath(
        file
    );

    const parsed = path.parse(
        relative
    );

    return path.join(
        paths.buildJs,
        parsed.dir,
        `${parsed.name}.min.js`
    );
}

function ensureDirectory(file) {
    fs.mkdirSync(
        path.dirname(file),
        {
            recursive: true
        }
    );
}

function copyFile(file) {
    const output = getOutputPath(file);

    ensureDirectory(output);

    fs.copyFileSync(
        file,
        output
    );
}

async function buildFile(file) {
    const output = getOutputPath(file);
    const minOutput = getMinOutputPath(file);

    ensureDirectory(output);
    ensureDirectory(minOutput);

    await esbuild.build({
        entryPoints: [file],

        outfile: output,

        bundle: false,

        format: 'iife',

        platform: 'browser',

        target: [
            'es2018'
        ],

        sourcemap: false,

        minify: false,

        charset: 'utf8'
    });

    await esbuild.build({
        entryPoints: [file],

        outfile: minOutput,

        bundle: false,

        format: 'iife',

        platform: 'browser',

        target: [
            'es2018'
        ],

        sourcemap: false,

        minify: true,

        charset: 'utf8'
    });
}

function removeBuildJs() {
    if (
        fs.existsSync(paths.buildJs)
    ) {
        fs.rmSync(
            paths.buildJs,
            {
                recursive: true,
                force: true
            }
        );
    }
}

async function buildScripts() {
    const files = getJsFiles(
        paths.js
    );

    removeBuildJs();

    for (const file of files) {
        if (isRawBuild) {
            copyFile(file);

            continue;
        }

        await buildFile(file);
    }
}

function createDevMiddleware() {
    return {
        name: 'scripts-dev',

        configureServer(server) {
            server.middlewares.use(
                '/js',
                (req, res, next) => {
                    const url = req.url || '/';

                    const relativePath =
                        decodeURIComponent(
                            url.split('?')[0]
                        ).replace(
                            /^\/+/,
                            ''
                        );

                    const file =
                        path.resolve(
                            paths.js,
                            relativePath
                        );

                    if (
                        !file.startsWith(
                            `${paths.js}${path.sep}`
                        )
                    ) {
                        next();

                        return;
                    }

                    if (
                        !fs.existsSync(file) ||
                        !fs.statSync(file).isFile()
                    ) {
                        next();

                        return;
                    }

                    if (
                        !file.endsWith('.js')
                    ) {
                        next();

                        return;
                    }

                    res.statusCode = 200;

                    res.setHeader(
                        'Content-Type',
                        'application/javascript; charset=utf-8'
                    );

                    res.end(
                        fs.readFileSync(
                            file,
                            'utf8'
                        )
                    );
                }
            );
        }
    };
}

export function processScripts() {
    return {
        name: 'process-scripts',

        apply: 'build',

        async closeBundle() {
            await buildScripts();
        }
    };
}

export function processScriptsDev() {
    return createDevMiddleware();
}