import { join, serveFile } from './deps.ts'
import { openWebsite } from "https://raw.githubusercontent.com/nhrones/Browser/master/browser.ts"
import { port, targetFolder } from './constants.ts'
import { postMessage } from './post.ts'
import { registerClient } from './send.ts'


const RunningOnDeploy = !!Deno.env.get("DENO_REGION")
const DEBUG = !!Deno.env.get("DEBUG")
console.log(`DEBUG = ${DEBUG}, RunningOnDeploy = ${RunningOnDeploy}`)

//=================================================
//             Start our Server                  //
//=================================================
Deno.serve({ port: port }, handleRequest )

   
//=================================================
//          Handle all http requests             //
//=================================================
function handleRequest(request: Request): Response | Promise<Response> {

   // Get and adjust the requested path name
   let { pathname } = new URL(request.url); // get the path name
   if (pathname === '/') pathname = '/index.html'; // fix root
   
   //=================================================
   //  request to register for Server Sent Events   //
   //=================================================
   if (pathname.includes("sse_registration")) {
      if (DEBUG) console.log('got sse_registration request!')
      return registerClient(request)
   }
    
   //=================================================
   //  A POST request: client is sending a message  //
   //================================================= 
   else if (request.method === 'POST') {
      if (DEBUG) console.log('handling POST request!')
      return postMessage(request)
   }
    
   //=================================================
   //           A file request: - send it           //
   //=================================================
   else {
      // the requested full-path (client folder?)
      const fullPath = (targetFolder.length > 0)
         ? join(Deno.cwd() + '/' + targetFolder + pathname)
         : join(Deno.cwd() + pathname);
      console.log(`Serving ${fullPath}`); // show what was requested
      // find the file -> get the content -> return it in a response
      return serveFile(request, fullPath)
   }
}

//  open the browser at `http://localhost:port`
if (!RunningOnDeploy) openWebsite(`http://localhost:${port}`);