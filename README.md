# web-font

A command-line tool that automates web font loading and localization best practices.

- compresses the @font-face unicode-range descriptors
- subsets fonts to unicode-range code points mapped by the font
- optimizes and converts fonts to WOFF version 1 with Zopfli compression and WOFF version 2 with Brotli compression
- exports @font-face at-rules, classes, noscript styles for each locale
- writes a font-loader script for loading locale-specific fonts in the browser

Check [escapace-web-font.netlify.app](https://escapace-web-font.netlify.app/) for a working example.

## Usage

1. Create a `web-font.config.js`, use [example/web-font.config.js](https://github.com/escapace/web-font/blob/trunk/example/web-font.config.js) as a reference.
2. Run `web-font` docker container.

   ```sh
   docker run --rm -it -v "$(pwd)":/wd escapace/web-font
   ```
