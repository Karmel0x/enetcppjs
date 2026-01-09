
const esbuild = require('esbuild');

async function build() {
  const ctx = await esbuild.context({
    entryPoints: [
      __dirname + '/src/*.ts',
    ],
    bundle: false,
    outdir: __dirname + '/dist',
    //packages: 'external',
    format: 'cjs',
    target: 'node24',
    platform: 'node',
    sourcemap: true,
    loader: {
      '.node': 'copy',
      //'.json': 'copy',
    },
    assetNames: '[name]',
    alias: {},
    keepNames: true,
    logLevel: 'info',
    plugins: [],
  });

  if (process.argv.includes('--watch'))
    await ctx.watch();
  else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

build();
