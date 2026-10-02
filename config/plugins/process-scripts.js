import fs from 'node:fs';
import path from 'node:path';

import * as esbuild from 'esbuild';

import { paths } from '../paths.js';

const isRawBuild =
    process.env.JS_BUILD_MODE === 'raw';

function getRootJsFiles() {
    if (
        !fs.existsSync(
            paths.js
        )
    ) {
        return [];
    }

    return fs.readdirSync(
        paths.js,
        {
            withFileTypes: true
        }
    )
        .filter(
            (entry) =>
                entry.isFile() &&
                entry.name.endsWith('.js') &&
                !entry.name.endsWith('.min.js')
        )
        .map(
            (entry) =>
                path.join(
                    paths.js,
                    entry.name
                )
        );
}

function getOutputPath(file) {
    return path.join(
        paths.buildJs,
        path.basename(file)
    );
}

function getMinOutputPath(file) {
    const parsed = path.parse(
        path.basename(file)
    );

    return path.join(
        paths.buildJs,
        `${parsed.name}.min.js`
    );
}

function ensureDirectory() {
    fs.mkdirSync(
        paths.buildJs,
        {
            recursive: true
        }
    );
}

function copyFile(file) {
    const output =
        getOutputPath(file);

    fs.copyFileSync(
        file,
        output
    );
}

async function buildFile(file) {
    const output =
        getOutputPath(file);

    const minOutput =
        getMinOutputPath(file);

    await esbuild.build({
        entryPoints: [
            file
        ],

        outfile: output,

        bundle: true,

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
        entryPoints: [
            file
        ],

        outfile: minOutput,

        bundle: true,

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
        fs.existsSync(
            paths.buildJs
        )
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
    const files =
        getRootJsFiles();

    removeBuildJs();

    ensureDirectory();

    for (const file of files) {
        if (isRawBuild) {
            copyFile(file);

            continue;
        }

        await buildFile(file);
    }
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