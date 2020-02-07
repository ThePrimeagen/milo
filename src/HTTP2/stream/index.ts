/**
                            +--------+
                    send PP |        | recv PP
                   ,--------|  idle  |--------.
                  /         |        |         \
                 v          +--------+          v
          +----------+          |           +----------+
          |          |          | send H /  |          |
   ,------| reserved |          | recv H    | reserved |------.
   |      | (local)  |          |           | (remote) |      |
   |      +----------+          v           +----------+      |
   |          |             +--------+             |          |
   |          |     recv ES |        | send ES     |          |
   |   send H |     ,-------|  open  |-------.     | recv H   |
   |          |    /        |        |        \    |          |
   |          v   v         +--------+         v   v          |
   |      +----------+          |           +----------+      |
   |      |   half   |          |           |   half   |      |
   |      |  closed  |          | send R /  |  closed  |      |
   |      | (remote) |          | recv R    | (local)  |      |
   |      +----------+          |           +----------+      |
   |           |                |                 |           |
   |           | send ES /      |       recv ES / |           |
   |           | send R /       v        send R / |           |
   |           | recv R     +--------+   recv R   |           |
   | send R /  `----------->|        |<-----------'  send R / |
   | recv R                 | closed |               recv R   |
   `----------------------->|        |<----------------------'
                            +--------+
*/

export enum StreamState {
    idle,
    reservedLocal,
    reservedRemote,
    open,
    halfClosedLocal,
    halfClosedRemote,
    closed,
}

export class Stream {
    private state: StreamState;
    private streamIdentifier: number;

    constructor(streamIdentifier: number) {
        this.streamIdentifier = streamIdentifier;
        this.state = StreamState.idle;
    }

    private transition(state: StreamState) {
        switch (state) {
            case StreamState.open:
                break;
            case StreamState.reservedLocal:
                break;
            case StreamState.reservedRemote:
                break;
            case StreamState.halfClosedLocal:
                break;
            case StreamState.halfClosedRemote:
                break;
            case StreamState.closed:
                break;
            default:
                throw new Error("You cannot transition to an unknown state: " + state);
                break;
        }
    }
}

