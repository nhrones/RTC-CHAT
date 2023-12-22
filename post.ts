
//======================================================
//           Our single BroadcastChannel              //
//====================================================== 
const bc = new BroadcastChannel("chat");

//======================================================
//    POST a message to a common BroadcastChannel     //
//======================================================
export async function postMessage(req: Request): Promise<Response> {
   let data = 'testing'
   if (req.method === 'POST') data = await req.json();
   bc.postMessage(data);
   console.info('data ', data)
   return new Response("", {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
   })
}
