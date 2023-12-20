
const DEBUG = true
const gBC = new BroadcastChannel("game");

export const  handler = async (_req: Request): Promise<Response> => {
    const dataObject = await _req.json();
        if (DEBUG) console.info('Client Posted:', dataObject)
        gBC.postMessage(dataObject);
        return new Response("",
        {
            status: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
        }
    );
  };
  