import { BunPlugin } from 'bun'
import * as compiler from '@marko/compiler'

// lookup is shared between resolveVirtualDependency and markoLoader
const virtualSources = new Map();

function resolveVirtualDependency( filename, { virtualPath, code, map } ){
  const virtualFilename = `${filename}?virtual=${virtualPath}`;

  // Add virtual source to the lookup to be later accessed by the loader
  virtualSources.set(virtualFilename, { code, map });

  // Generate the webpack path, from right to left...
  // 1. Pass the virtualFilename so webpack can find the real file
  //    located at sourceFilename, but the virtualPath is also present
  //    (eg. "./index.marko?virtual=./index.marko.css")
  // 2. Use an inline loader to run this file through @marko/webpack/loader
  //    https://webpack.js.org/concepts/loaders/#inline
  // 3. Use an inline matchResource to redefine this as the virtualPath
  //    which allows the appropriate loaders to match the virtual dependency
  //    https://webpack.js.org/api/loaders/#inline-matchresource
  return `${virtualPath}!=!@marko/bun/loader!${virtualFilename}`;
}

function markoLoader( path ){
  console.log( path )
  let results

  // The default behavior is to compile the template in dom output mode
  results = compiler.compileFileSync( path, {
    modules: 'cjs',
    output: 'dom',
    // resolveVirtualDependency
  })

  // console.log( results )
  return results.code
}

export const Marko: BunPlugin = {
  name: 'marko',
  setup( build ){
    build.onLoad({ filter: /.marko$/ }, ({ path }) => {
      // const destinationPath = '/tmp/mmk.js'
      return { 
        contents: markoLoader( path ), 
        // path: destinationPath
      }
    })
  }
}