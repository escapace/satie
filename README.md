# satie

A command-line tool that automates web font loading and localization best practices.

- compresses the @font-face unicode-range descriptors
- subsets fonts to unicode-range code points mapped by the font
- optimizes and converts fonts to WOFF version 1 with Zopfli compression and WOFF version 2 with Brotli compression
- exports @font-face at-rules, classes, noscript styles for each locale
- writes a font-loader script for loading locale-specific fonts in the browser
