import {build} from 'esbuild';
import {readFile,copyFile,mkdir} from 'node:fs/promises';
await mkdir('vendor',{recursive:true});
await build({entryPoints:['pdf-runtime.js'],bundle:true,minify:true,format:'iife',globalName:'PocketPDF',outfile:'vendor/pdf-runtime.js',target:['safari16.4'],plugins:[{name:'inline-worker',setup(build){build.onLoad({filter:/pdf\.worker\.min\.mjs$/},async args=>({contents:await readFile(args.path,'utf8'),loader:'text'}));}}]});
await copyFile('node_modules/pdfjs-dist/LICENSE','vendor/pdfjs-LICENSE.txt');
