import fs from 'node:fs';
import path from 'node:path';

import beautify from 'js-beautify';

import { paths } from '../paths.js';

const supportedExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png'
]);

const inlineTags = [
    'a',
    'span',
    'strong',
    'b',
    'em',
    'i',
    'small',
    'label',
    'button'
];

function processHtml(html) {
    return html.replace(
        /<img\b([^>]*?)>/gi,
        (
            fullMatch,
            attributes,
            offset
        ) => {
            const before =
                html.slice(
                    0,
                    offset
                );

            const pictureStart =
                before.lastIndexOf(
                    '<picture'
                );

            const pictureEnd =
                before.lastIndexOf(
                    '</picture>'
                );

            if (
                pictureStart > pictureEnd
            ) {
                return fullMatch;
            }

            if (
                /\bdata-no-picture(?:\s|=|>|$)/i.test(
                    attributes
                )
            ) {
                return fullMatch;
            }

            const srcMatch =
                attributes.match(
                    /\bsrc\s*=\s*["']([^"']+)["']/i
                );

            if (!srcMatch) {
                return fullMatch;
            }

            const src =
                srcMatch[1];

            const cleanSrc =
                src
                    .split('?')[0]
                    .split('#')[0];

            let relativePath;

            if (
                cleanSrc.startsWith(
                    '/img/'
                )
            ) {
                relativePath =
                    cleanSrc.replace(
                        /^\/img\//,
                        ''
                    );
            } else if (
                cleanSrc.startsWith(
                    'img/'
                )
            ) {
                relativePath =
                    cleanSrc.replace(
                        /^img\//,
                        ''
                    );
            } else {
                return fullMatch;
            }

            const sourceFile =
                path.resolve(
                    paths.img,
                    relativePath
                );

            const normalizedImgPath =
                path.resolve(
                    paths.img
                );

            if (
                sourceFile !== normalizedImgPath &&
                !sourceFile.startsWith(
                    `${normalizedImgPath}${path.sep}`
                )
            ) {
                return fullMatch;
            }

            if (
                !fs.existsSync(
                    sourceFile
                ) ||
                !fs.statSync(
                    sourceFile
                ).isFile()
            ) {
                return fullMatch;
            }

            const extension =
                path.extname(
                    sourceFile
                ).toLowerCase();

            if (
                !supportedExtensions.has(
                    extension
                )
            ) {
                return fullMatch;
            }

            const webpSrc =
                cleanSrc.replace(
                    /\.(jpe?g|png)$/i,
                    '.webp'
                );

            const finalSrc =
                cleanSrc.replace(
                    /^\/+/,
                    ''
                );

            const finalWebpSrc =
                webpSrc.replace(
                    /^\/+/,
                    ''
                );

            const finalAttributes =
                attributes.replace(
                    srcMatch[0],
                    `src="${finalSrc}"`
                );

            return [
                '<picture>',
                `    <source srcset="${finalWebpSrc}" type="image/webp">`,
                `    <img${finalAttributes}>`,
                '</picture>'
            ].join('\n');
        }
    );
}

function protectInlineElements(html) {
    const elements = [];

    const pattern =
        new RegExp(
            `<(${inlineTags.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1>`,
            'gi'
        );

    const protectedHtml =
        html.replace(
            pattern,
            match => {
                const index =
                    elements.length;

                elements.push(
                    match
                );

                return `___INLINE_ELEMENT_${index}___`;
            }
        );

    return {
        html: protectedHtml,
        elements
    };
}

function restoreInlineElements(
    html,
    elements
) {
    return html.replace(
        /___INLINE_ELEMENT_(\d+)___/g,
        (
            fullMatch,
            index
        ) => {
            return elements[
                Number(index)
                ];
        }
    );
}

function prepareHtml(html) {
    let prepared =
        html;

    prepared =
        prepared.replace(
            />\s*</g,
            '>\n<'
        );

    prepared =
        prepared.replace(
            /(<\/(?:html|head|body|header|main|section|footer|nav|div|article|aside|ul|ol|li|form|picture)>)(?=<)/gi,
            '$1\n'
        );

    return prepared;
}

function formatHtml(html) {
    const {
        html: protectedHtml,
        elements
    } = protectInlineElements(
        html
    );

    const prepared =
        prepareHtml(
            protectedHtml
        );

    let formatted =
        beautify.html(
            prepared,
            {
                indent_size: 4,
                indent_char: ' ',

                max_preserve_newlines: 1,
                preserve_newlines: true,

                wrap_line_length: 120,

                indent_inner_html: true,

                extra_liners: [
                    'head',
                    'body',
                    '/html'
                ],

                unformatted: [],

                content_unformatted: []
            }
        );

    formatted =
        restoreInlineElements(
            formatted,
            elements
        );

    formatted =
        formatted.replace(
            /^[ \t]*___INLINE_ELEMENT_(\d+)___[ \t]*$/gm,
            (
                fullMatch,
                index
            ) => {
                return elements[
                    Number(index)
                    ];
            }
        );

    formatted =
        formatted.replace(
            /([ \t]*)___INLINE_ELEMENT_(\d+)___/g,
            (
                fullMatch,
                indentation,
                index
            ) => {
                return (
                    indentation +
                    elements[
                        Number(index)
                        ]
                );
            }
        );

    formatted =
        formatted.replace(
            /\n{2,}/g,
            '\n'
        );

    formatted =
        formatted
            .split('\n')
            .map(
                line =>
                    line.trimEnd()
            )
            .join('\n')
            .trim();

    return `${formatted}\n`;
}

function processDirectory(directory) {
    if (
        !fs.existsSync(
            directory
        )
    ) {
        return;
    }

    for (
        const entry of fs.readdirSync(
        directory,
        {
            withFileTypes: true
        }
    )
        ) {
        const filePath =
            path.join(
                directory,
                entry.name
            );

        if (
            entry.isDirectory()
        ) {
            processDirectory(
                filePath
            );

            continue;
        }

        if (
            !entry.isFile() ||
            !entry.name.endsWith(
                '.html'
            )
        ) {
            continue;
        }

        const html =
            fs.readFileSync(
                filePath,
                'utf8'
            );

        const processed =
            processHtml(
                html
            );

        const formatted =
            formatHtml(
                processed
            );

        if (
            formatted !== html
        ) {
            fs.writeFileSync(
                filePath,
                formatted,
                'utf8'
            );
        }
    }
}

export function pictureHtml() {
    return {
        name: 'picture-html',

        hooks: {
            'astro:build:done': () => {
                processDirectory(
                    paths.build
                );
            }
        }
    };
}