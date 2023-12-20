
//======================================================
//           Our single BroadcastChannel              //
//====================================================== 
const bc = new BroadcastChannel("sse");

//======================================================
//    POST a message to a common BroadcastChannel     //
//======================================================
export async function postMessage(req: Request): Promise<Response> {
   const data = await req.json();
   bc.postMessage(data);
   return new Response("", { status: 200 })
}
