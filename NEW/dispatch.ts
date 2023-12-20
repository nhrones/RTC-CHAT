
const DEBUG = true

export const handler = (_req: Request): Response => {

    const { searchParams } = new URL(_req.url);

    const id = searchParams.get('id') || ''
    if (DEBUG) console.log('Client registering for SSE -- id-', id)

    const connection = new SignalConnection(id)

    return connection.connect()
};

/** A Server Sent Events stream connection class */
class SignalConnection {

    static connections = 0
    id = ''

    stream: ReadableStream | null

    constructor(id: string) {
        this.id = id;
        this.stream = null
    }

    connect(): Response {

        // notify if the game is full
        if (SignalConnection.connections >= 40) {
            if (DEBUG) console.log('User ' + this.id + ' tried to connect! connections: ' + SignalConnection.connections)
            return new Response("", { status: 404 })
        }

        const sseChannel = new BroadcastChannel("game");

        SignalConnection.connections++

        console.log('User ' + this.id + ' connected! connections: ' + SignalConnection.connections)

        this.stream = new ReadableStream({

            /** Start: is called immediately when the object is constructed.
             *  Each readable stream has an associated controller that, 
             *  as the name suggests, allows you to control the stream. */
            start: (controller) => {


                // send the client their new ID
                const setID = JSON.stringify({ data: { id: this.id } })
                controller.enqueue('event: SetID\ndata: ' + setID + '\nretry: 300000\n\n')

                sseChannel.onmessage = (e) => {

                    // BC messages are posted as 'Objects'
                    const dataObject = e.data
                    const { from } = dataObject

                    const event = ('event' in dataObject === true) ? dataObject.event : null
                    if (event) {
                        // disconnect the stream
                        if (event === 'close' && from === this.id) {
                            sseChannel.close()
                            this.stream = null
                            SignalConnection.disconnect('recieved a <close> event -> ' + dataObject.data)
                            return new Response("", { status: 404 })
                        } else if (from !== this.id) {
                            controller.enqueue('event: ' + dataObject.event + '\n' +
                                'data: ' + JSON.stringify(dataObject) + '\n\n');
                        }
                    }
                    // We don't send messages to our self!
                    if (from !== this.id) {
                        if (DEBUG) console.info('SSE sending: ', dataObject)
                        controller.enqueue('data: ' + JSON.stringify(dataObject) + '\n\n');
                    }
                };
            },

            /** Called when the stream consumer cancels the stream. */
            cancel() {
                if (DEBUG) console.log('User was disconnected! connections: ', SignalConnection.connections)
                SignalConnection.disconnect('User disconnected!')
                sseChannel.close();
            },

        });


        // Stream.pipeThrough - Provides a chainable way of piping the current stream 
        return new Response(this.stream.pipeThrough(new TextEncoderStream()), {
            headers: {
                "content-type": "text/event-stream",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "no-cache"
            },
        });

    }
    static disconnect(reason: string) {
        SignalConnection.connections--
        console.log('Disconnected! reason:', reason)
        console.log('connection count = ', SignalConnection.connections)
    }
}