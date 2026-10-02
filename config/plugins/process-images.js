import fs from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';

import { paths } from '../paths.js';

const rasterExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png'
]);

function getFiles(directory) {
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
        const fullPath =
            path.join(
                directory,
                entry.name
            );

        if (entry.isDirectory()) {
            files.push(
                ...getFiles(fullPath)
            );

            continue;
        }

        if (entry.isFile()) {
            files.push(fullPath);
        }
    }

    return files;
}

async function processFile(file) {
    const extension =
        path.extname(
            file
        ).toLowerCase();

    const relative =
        path.relative(
            paths.img,
            file
        );

    const parsed =
        path.parse(
            relative
        );

    const outputDirectory =
        path.join(
            paths.buildImg,
            parsed.dir
        );

    fs.mkdirSync(
        outputDirectory,
        {
            recursive: true
        }
    );

    const outputFile =
        path.join(
            outputDirectory,
            parsed.base
        );

    /*
     * SVG, GIF, WebP, AVIF и другие
     * файлы просто копируем.
     */

    if (
        !rasterExtensions.has(
            extension
        )
    ) {
        fs.copyFileSync(
            file,
            outputFile
        );

        return;
    }

    /*
     * JPG / JPEG
     */

    if (
        extension === '.jpg' ||
        extension === '.jpeg'
    ) {
        await sharp(file)
            .jpeg({
                quality: 82,
                mozjpeg: true
            })
            .toFile(
                outputFile
            );
    }

    /*
     * PNG
     */

    if (
        extension === '.png'
    ) {
        await sharp(file)
            .png({
                compressionLevel: 9,
                adaptiveFiltering: true
            })
            .toFile(
                outputFile
            );
    }

    /*
     * WebP
     */

    await sharp(file)
        .webp({
            quality: 82
        })
        .toFile(
            path.join(
                outputDirectory,
                `${parsed.name}.webp`
            )
        );
}

async function buildImages() {
    const files =
        getFiles(
            paths.img
        );

    for (const file of files) {
        await processFile(file);
    }
}

function removeBuildImg() {
    if (
        fs.existsSync(
            paths.buildImg
        )
    ) {
        fs.rmSync(
            paths.buildImg,
            {
                recursive: true,
                force: true
            }
        );
    }
}

export function processImages() {
    return {
        name: 'process-images',

        apply: 'build',

        async closeBundle() {
            removeBuildImg();

            await buildImages();
        }
    };
}