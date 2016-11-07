import { IStream, Stream } from "../models/stream.model";
import { INotification, Notification } from "../models/notification.model";

import { NotificationSocket } from "../sockets/notification.socket";
import {log} from '../app'

export class StreamSocket {
    nsp: any;
    name: string;
    data: any;
    socket: any;
    streams: any = {};

    /**
     * Constructor.
     *
     * @class StreamSocket
     * @constructor
     * @param io any
     */
    constructor(private io: any) {
        this.nsp = this.io.of("/stream");
        this.nsp.on("connection", (socket: any) => {
            log.info("Client connected");
            this.socket = socket;
            this.listen();
        });
    }

    /**
     * Add signal
     *
     * @class StreamSocket
     * @method listen
     * @return void
     */
    private listen(): void {
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("create", (name: string) => this.create(name));
        this.socket.on("remove", (name: string) => this.remove(name));
        this.socket.on("list", () => this.list());
    }

    /**
     * Handle disconnect
     *
     * @class StreamSocket
     * @method disconnect
     * @return void
     */
    private disconnect(): void {
        log.info("Client disconnected");
    }

    /**
     * Create stream and emit it
     *
     * @class StreamSocket
     * @method createStream
     * @param stream IStream
     * @return void
     */
    private createStream(stream: IStream): void {
        if (!this.streams[stream.name]) {
            log.info("Creating namespace for stream:", stream.name);
            this.streams[stream.name] = new NotificationSocket(this.io, stream.name);
        }
        this.nsp.emit("create", stream);        
    }

    /**
     * Create a stream
     *
     * @class StreamSocket
     * @method create
     * @param name string
     * @return void
     */
    private create(name: string): void {
        Stream.create({
            name: name,
            created: new Date(),
            notifications: []
        }, (error: any, stream: IStream) => {
            if (!error && stream) {
                this.createStream(stream);
            }
        });
    }

    /**
     * Remove a stream
     *
     * @class StreamSocket
     * @method remove
     * @param name string
     * @return void
     */
    private remove(name: string): void {
        // First remove stream notifications
        Notification.remove({
            stream: name
        }).exec();

        // Remove stream
        Stream.remove({
            name: name
        }).exec( (error: any, stream: IStream) => {
            if (!error && stream) {
                this.nsp.emit("remove", stream);
            }
        });
    }

    /**
     * List all streams
     *
     * @class ControlSocket
     * @method list
     * @return void
     */
    private list(): void {
        if (this.socket && this.socket.connected) {
            Stream.find({}).exec( (error: any, streams: IStream[]) => {
                for (let stream of streams) {
                    this.createStream(stream);
                }
            });
        }
    }
}