import { serve, build, file } from 'bun'
import { Marko } from './plugins'

async function checkExists( filepath: string ): Promise<boolean>{
  try { if( await file( filepath ).text() ) return true }
  catch( error ){ return false }
}

async function fetch( req ){
  const url = new URL( req.url )
  
  if( url.pathname.includes('remote') ){
    let 
    pathname = url.pathname.replace('/remote', ''),
    filepath

    if( /\.(marko|jsx|tsx)$/.test( pathname ) )
      filepath = pathname
    
    // Resolve component's extension
    else {
      // Check marko component by default
      filepath = `./packages${pathname}/index.marko`

      if( !(await checkExists( filepath )) ) filepath = `./packages${pathname}/index.jsx`
      if( !(await checkExists( filepath )) ) filepath = `./packages${pathname}/index.tsx`
      if( !(await checkExists( filepath )) ) throw new Error(`<${pathname}> Not found`)
    }
    
    const results = await build({
      entrypoints: [ filepath ],
      target: 'browser',
      root: '.',
      plugins: [ Marko ]
    })
    
    return new Response( results.outputs[0], {
      headers: { 'Access-Control-Allow-Origin': '*' }
    } )
  }

  return new Response(`${url.pathname} Not Found`)
}

async function error( error ){
  const errorResponse = {
    headers: { 'Content-Type': 'text/html' }
  }

  return new Response(`<pre>${error}\n${error.stack}</pre>`, errorResponse )
}

serve({
  port: 65000,
  development: true,
  fetch,
  error
})