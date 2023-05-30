import * as BinaryPack from "peerjs-js-binarypack";
import { EventEmitter, ValidEventTypes } from "eventemitter3";
export interface UtilSupportsObj {
    /**
     * The current browser.
     * This property can be useful in determining whether two peers can connect.
     *
     * ```ts
     * if (util.browser === 'firefox') {
     *  // OK to peer with Firefox peers.
     * }
     * ```
     *
     * `util.browser` can currently have the values
     * `'firefox', 'chrome', 'safari', 'edge', 'Not a supported browser.', 'Not a browser.' (unknown WebRTC-compatible agent).
     */
    browser: boolean;
    webRTC: boolean;
    /**
     * True if the current browser supports media streams and PeerConnection.
     */
    audioVideo: boolean;
    /**
     * True if the current browser supports DataChannel and PeerConnection.
     */
    data: boolean;
    binaryBlob: boolean;
    /**
     * True if the current browser supports reliable DataChannels.
     */
    reliable: boolean;
}
export class Util {
    noop(): void;
    readonly CLOUD_HOST = "0.peerjs.com";
    readonly CLOUD_PORT = 443;
    readonly chunkedBrowsers: {
        Chrome: number;
        chrome: number;
    };
    readonly chunkedMTU = 16300;
    readonly defaultConfig: {
        iceServers: ({
            urls: string;
            username?: undefined;
            credential?: undefined;
        } | {
            urls: string[];
            username: string;
            credential: string;
        })[];
        sdpSemantics: string;
    };
    readonly browser: string;
    readonly browserVersion: number;
    /**
     * A hash of WebRTC features mapped to booleans that correspond to whether the feature is supported by the current browser.
     *
     * :::caution
     * Only the properties documented here are guaranteed to be present on `util.supports`
     * :::
     */
    readonly supports: UtilSupportsObj;
    validateId(id: string): boolean;
    pack: typeof BinaryPack.pack;
    unpack: typeof BinaryPack.unpack;
    chunk(blob: Blob): {
        __peerData: number;
        n: number;
        total: number;
        data: Blob;
    }[];
    blobToArrayBuffer(blob: Blob, cb: (arg: ArrayBuffer | null) => void): FileReader;
    binaryStringToArrayBuffer(binary: string): ArrayBuffer | SharedArrayBuffer;
    randomToken(): string;
    isSecure(): boolean;
}
/**
 * Provides a variety of helpful utilities.
 *
 * :::caution
 * Only the utilities documented here are guaranteed to be present on `util`.
 * Undocumented utilities can be removed without warning.
 * We don't consider these to be breaking changes.
 * :::
 */
export const util: Util;
export enum LogLevel {
    /**
     * Prints no logs.
     */
    Disabled = 0,
    /**
     * Prints only errors.
     */
    Errors = 1,
    /**
     * Prints errors and warnings.
     */
    Warnings = 2,
    /**
     * Prints all logs.
     */
    All = 3
}
export enum ConnectionType {
    Data = "data",
    Media = "media"
}
export enum PeerErrorType {
    /**
     * The client's browser does not support some or all WebRTC features that you are trying to use.
     */
    BrowserIncompatible = "browser-incompatible",
    /**
     * You've already disconnected this peer from the server and can no longer make any new connections on it.
     */
    Disconnected = "disconnected",
    /**
     * The ID passed into the Peer constructor contains illegal characters.
     */
    InvalidID = "invalid-id",
    /**
     * The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).
     */
    InvalidKey = "invalid-key",
    /**
     * Lost or cannot establish a connection to the signalling server.
     */
    Network = "network",
    /**
     * The peer you're trying to connect to does not exist.
     */
    PeerUnavailable = "peer-unavailable",
    /**
     * PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.
     */
    SslUnavailable = "ssl-unavailable",
    /**
     * Unable to reach the server.
     */
    ServerError = "server-error",
    /**
     * An error from the underlying socket.
     */
    SocketError = "socket-error",
    /**
     * The underlying socket closed unexpectedly.
     */
    SocketClosed = "socket-closed",
    /**
     * The ID passed into the Peer constructor is already taken.
     *
     * :::caution
     * This error is not fatal if your peer has open peer-to-peer connections.
     * This can happen if you attempt to {@apilink Peer.reconnect} a peer that has been disconnected from the server,
     * but its old ID has now been taken.
     * :::
     */
    UnavailableID = "unavailable-id",
    /**
     * Native WebRTC errors.
     */
    WebRTC = "webrtc"
}
export enum SerializationType {
    Binary = "binary",
    BinaryUTF8 = "binary-utf8",
    JSON = "json"
}
export enum SocketEventType {
    Message = "message",
    Disconnected = "disconnected",
    Error = "error",
    Close = "close"
}
export enum ServerMessageType {
    Heartbeat = "HEARTBEAT",
    Candidate = "CANDIDATE",
    Offer = "OFFER",
    Answer = "ANSWER",
    Open = "OPEN",
    Error = "ERROR",
    IdTaken = "ID-TAKEN",
    InvalidKey = "INVALID-KEY",
    Leave = "LEAVE",
    Expire = "EXPIRE"
}
/**
 * An abstraction on top of WebSockets to provide fastest
 * possible connection for peers.
 */
declare class Socket extends EventEmitter {
    constructor(secure: any, host: string, port: number, path: string, key: string, pingInterval?: number);
    start(id: string, token: string): void;
    /** Exposed send for DC & Peer. */
    send(data: any): void;
    close(): void;
}
declare class ServerMessage {
    type: ServerMessageType;
    payload: any;
    src: string;
}
export type BaseConnectionEvents = {
    /**
     * Emitted when either you or the remote peer closes the connection.
     *
     * ```ts
     * connection.on('close', () => { ... });
     * ```
     */
    close: () => void;
    /**
     * ```ts
     * connection.on('error', (error) => { ... });
     * ```
     */
    error: (error: Error) => void;
    iceStateChanged: (state: RTCIceConnectionState) => void;
};
export abstract class BaseConnection<T extends ValidEventTypes> extends EventEmitter<T & BaseConnectionEvents> {
    /**
     * The ID of the peer on the other end of this connection.
     */
    readonly peer: string;
    provider: Peer;
    readonly options: any;
    protected _open: boolean;
    /**
     * Any type of metadata associated with the connection,
     * passed in by whoever initiated the connection.
     */
    readonly metadata: any;
    connectionId: string;
    peerConnection: RTCPeerConnection;
    abstract get type(): ConnectionType;
    /**
     * Whether the media connection is active (e.g. your call has been answered).
     * You can check this if you want to set a maximum wait time for a one-sided call.
     */
    get open(): boolean;
    constructor(
    /**
     * The ID of the peer on the other end of this connection.
     */
    peer: string, provider: Peer, options: any);
    abstract close(): void;
    /**
     * @internal
     */
    abstract handleMessage(message: ServerMessage): void;
}
export type DataConnectionEvents = {
    /**
     * Emitted when data is received from the remote peer.
     *
     * ```ts
     * dataConnection.on('data', (data) => { ... });
     * ```
     */
    data: (data: unknown) => void;
    /**
     * Emitted when the connection is established and ready-to-use.
     *
     * ```ts
     * dataConnection.on('open', () => { ... });
     * ```
     */
    open: () => void;
};
/**
 * Wraps WebRTC's DataChannel.
 * To get one, use {@apilink Peer.connect} or listen for the {@apilink PeerEvents | `connect`} event.
 */
export class DataConnection extends BaseConnection<DataConnectionEvents> implements DataConnection {
    /**
     * The optional label passed in or assigned by PeerJS when the connection was initiated.
     */
    readonly label: string;
    /**
     * The serialization format of the data sent over the connection.
     * {@apilink SerializationType | possible values}
     */
    readonly serialization: SerializationType;
    /**
     * Whether the underlying data channels are reliable; defined when the connection was initiated.
     */
    readonly reliable: boolean;
    stringify: (data: any) => string;
    parse: (data: string) => any;
    get type(): ConnectionType;
    /**
     * A reference to the RTCDataChannel object associated with the connection.
     */
    get dataChannel(): RTCDataChannel;
    get bufferSize(): number;
    constructor(peerId: string, provider: Peer, options: any);
    /** Called by the Negotiator when the DataChannel is ready. */
    initialize(dc: RTCDataChannel): void;
    /**
     * Exposed functionality for users.
     */
    /** Allows user to close connection. */
    close(): void;
    /**
     * `data` is serialized and sent to the remote peer.
     * @param data You can send any type of data, including objects, strings, and blobs.
     * @returns
     */
    send(data: any, chunked?: boolean): void;
    /**
     * @internal
     */
    handleMessage(message: ServerMessage): void;
}
export interface AnswerOption {
    /**
     * Function which runs before create answer to modify sdp answer message.
     */
    sdpTransform?: Function;
}
export interface PeerJSOption {
    key?: string;
    host?: string;
    port?: number;
    path?: string;
    secure?: boolean;
    token?: string;
    config?: RTCConfiguration;
    debug?: number;
    referrerPolicy?: ReferrerPolicy;
}
export interface PeerConnectOption {
    /**
     * A unique label by which you want to identify this data connection.
     * If left unspecified, a label will be generated at random.
     *
     * Can be accessed with {@apilink DataConnection.label}
     */
    label?: string;
    /**
     * Metadata associated with the connection, passed in by whoever initiated the connection.
     *
     * Can be accessed with {@apilink DataConnection.metadata}.
     * Can be any serializable type.
     */
    metadata?: any;
    serialization?: string;
    reliable?: boolean;
}
export interface CallOption {
    /**
     * Metadata associated with the connection, passed in by whoever initiated the connection.
     *
     * Can be accessed with {@apilink MediaConnection.metadata}.
     * Can be any serializable type.
     */
    metadata?: any;
    /**
     * Function which runs before create offer to modify sdp offer message.
     */
    sdpTransform?: Function;
}
export type MediaConnectionEvents = {
    /**
     * Emitted when a connection to the PeerServer is established.
     *
     * ```ts
     * mediaConnection.on('stream', (stream) => { ... });
     * ```
     */
    stream: (stream: MediaStream) => void;
};
/**
 * Wraps WebRTC's media streams.
 * To get one, use {@apilink Peer.call} or listen for the {@apilink PeerEvents | `call`} event.
 */
export class MediaConnection extends BaseConnection<MediaConnectionEvents> {
    /**
     * For media connections, this is always 'media'.
     */
    get type(): ConnectionType;
    get localStream(): MediaStream;
    get remoteStream(): MediaStream;
    constructor(peerId: string, provider: Peer, options: any);
    addStream(remoteStream: any): void;
    /**
     * @internal
     */
    handleMessage(message: ServerMessage): void;
    /**
     * When receiving a {@apilink PeerEvents | `call`} event on a peer, you can call
     * `answer` on the media connection provided by the callback to accept the call
     * and optionally send your own media stream.

     *
     * @param stream A WebRTC media stream.
     * @param options
     * @returns
     */
    answer(stream?: MediaStream, options?: AnswerOption): void;
    /**
     * Exposed functionality for users.
     */
    /**
     * Closes the media connection.
     */
    close(): void;
}
export class PeerOptions implements PeerJSOption {
    /**
     * Prints log messages depending on the debug level passed in.
     */
    debug?: LogLevel;
    /**
     * Server host. Defaults to `0.peerjs.com`.
     * Also accepts `'/'` to signify relative hostname.
     */
    host?: string;
    /**
     * Server port. Defaults to `443`.
     */
    port?: number;
    /**
     * The path where your self-hosted PeerServer is running. Defaults to `'/'`
     */
    path?: string;
    /**
     * API key for the PeerServer.
     * This is not used anymore.
     * @deprecated
     */
    key?: string;
    token?: string;
    /**
     * Configuration hash passed to RTCPeerConnection.
     * This hash contains any custom ICE/TURN server configuration.
     *
     * Defaults to {@apilink util.defaultConfig}
     */
    config?: any;
    /**
     * Set to true `true` if you're using TLS.
     * :::danger
     * If possible *always use TLS*
     * :::
     */
    secure?: boolean;
    pingInterval?: number;
    referrerPolicy?: ReferrerPolicy;
    logFunction?: (logLevel: LogLevel, ...rest: any[]) => void;
}
export class PeerError extends Error {
    constructor(type: PeerErrorType, err: Error | string);
    type: PeerErrorType;
}
export type PeerEvents = {
    /**
     * Emitted when a connection to the PeerServer is established.
     *
     * You may use the peer before this is emitted, but messages to the server will be queued. <code>id</code> is the brokering ID of the peer (which was either provided in the constructor or assigned by the server).<span class='tip'>You should not wait for this event before connecting to other peers if connection speed is important.</span>
     */
    open: (id: string) => void;
    /**
     * Emitted when a new data connection is established from a remote peer.
     */
    connection: (dataConnection: DataConnection) => void;
    /**
     * Emitted when a remote peer attempts to call you.
     */
    call: (mediaConnection: MediaConnection) => void;
    /**
     * Emitted when the peer is destroyed and can no longer accept or create any new connections.
     */
    close: () => void;
    /**
     * Emitted when the peer is disconnected from the signalling server
     */
    disconnected: (currentId: string) => void;
    /**
     * Errors on the peer are almost always fatal and will destroy the peer.
     *
     * Errors from the underlying socket and PeerConnections are forwarded here.
     */
    error: (error: PeerError) => void;
};
/**
 * A peer who can initiate connections with other peers.
 */
export class Peer extends EventEmitter<PeerEvents> {
    /**
     * The brokering ID of this peer
     *
     * If no ID was specified in {@apilink Peer | the constructor},
     * this will be `undefined` until the {@apilink PeerEvents | `open`} event is emitted.
     */
    get id(): string;
    get options(): PeerOptions;
    get open(): boolean;
    /**
     * @internal
     */
    get socket(): Socket;
    /**
     * A hash of all connections associated with this peer, keyed by the remote peer's ID.
     * @deprecated
     * Return type will change from Object to Map<string,[]>
     */
    get connections(): Object;
    /**
     * true if this peer and all of its connections can no longer be used.
     */
    get destroyed(): boolean;
    /**
     * false if there is an active connection to the PeerServer.
     */
    get disconnected(): boolean;
    /**
     * A peer can connect to other peers and listen for connections.
     */
    constructor();
    /**
     * A peer can connect to other peers and listen for connections.
     * @param options for specifying details about PeerServer
     */
    constructor(options: PeerOptions);
    /**
     * A peer can connect to other peers and listen for connections.
     * @param id Other peers can connect to this peer using the provided ID.
     *     If no ID is given, one will be generated by the brokering server.
     * The ID must start and end with an alphanumeric character (lower or upper case character or a digit). In the middle of the ID spaces, dashes (-) and underscores (_) are allowed. Use {@apilink PeerOptions.metadata } to send identifying information.
     * @param options for specifying details about PeerServer
     */
    constructor(id: string, options?: PeerOptions);
    /**
     * Retrieve messages from lost message store
     * @internal
     */
    _getMessages(connectionId: string): ServerMessage[];
    /**
     * Connects to the remote peer specified by id and returns a data connection.
     * @param peer The brokering ID of the remote peer (their {@apilink Peer.id}).
     * @param options for specifying details about Peer Connection
     */
    connect(peer: string, options?: PeerConnectOption): DataConnection;
    /**
     * Calls the remote peer specified by id and returns a media connection.
     * @param peer The brokering ID of the remote peer (their peer.id).
     * @param stream The caller's media stream
     * @param options Metadata associated with the connection, passed in by whoever initiated the connection.
     */
    call(peer: string, stream: MediaStream, options?: CallOption): MediaConnection;
    _removeConnection(connection: DataConnection | MediaConnection): void;
    /** Retrieve a data/media connection for this peer. */
    getConnection(peerId: string, connectionId: string): null | DataConnection | MediaConnection;
    /** Emits a typed error message. */
    emitError(type: PeerErrorType, err: string | Error): void;
    /**
     * Destroys the Peer: closes all active connections as well as the connection
     * to the server.
     *
     * :::caution
     * This cannot be undone; the respective peer object will no longer be able
     * to create or receive any connections, its ID will be forfeited on the server,
     * and all of its data and media connections will be closed.
     * :::
     */
    destroy(): void;
    /**
     * Disconnects the Peer's connection to the PeerServer. Does not close any
     *  active connections.
     * Warning: The peer can no longer create or accept connections after being
     *  disconnected. It also cannot reconnect to the server.
     */
    disconnect(): void;
    /** Attempts to reconnect with the same ID.
     *
     * Only {@apilink Peer.disconnect | disconnected peers} can be reconnected.
     * Destroyed peers cannot be reconnected.
     * If the connection fails (as an example, if the peer's old ID is now taken),
     * the peer's existing connections will not close, but any associated errors events will fire.
     */
    reconnect(): void;
    /**
     * Get a list of available peer IDs. If you're running your own server, you'll
     * want to set allow_discovery: true in the PeerServer options. If you're using
     * the cloud server, email team@peerjs.com to get the functionality enabled for
     * your key.
     */
    listAllPeers(cb?: (_: any[]) => void): void;
}
export default Peer;

//# sourceMappingURL=types.d.ts.map
