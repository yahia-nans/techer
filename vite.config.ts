import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function inlineSingleFilePlugin(): Plugin {
  return {
    name: 'inline-single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlAsset = bundle['index.html'];
      if (!htmlAsset || htmlAsset.type !== 'asset') return;

      let html = String(htmlAsset.source);

      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'asset' && fileName.endsWith('.css')) {
          const cssHrefRegex = new RegExp(
            `<link[^>]*href=["']\\.?/?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`,
            'gi'
          );
          if (cssHrefRegex.test(html)) {
            html = html.replace(cssHrefRegex, () => `<style>\n${String(chunk.source)}\n</style>`);
            delete bundle[fileName];
          }
        } else if (chunk.type === 'chunk' && chunk.isEntry) {
          const scriptRegex = new RegExp(
            `<script[^>]*src=["']\\.?/?${fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*><\\/script>`,
            'gi'
          );
          if (scriptRegex.test(html)) {
            const safeCode = chunk.code.replace(/<\/script>/gi, '<\\/script>');
            html = html.replace(
              scriptRegex,
              () => `<script type="module">\n${safeCode}\n</script>`
            );
            delete bundle[fileName];
          }
        }
      }

      htmlAsset.source = html;
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      inlineSingleFilePlugin(),
      // Copies src/assets into dist/ as an extra fallback if anything references root-relative paths.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    build: {
      assetsInlineLimit: 2_000_000,
      cssCodeSplit: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
