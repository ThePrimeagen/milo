
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

