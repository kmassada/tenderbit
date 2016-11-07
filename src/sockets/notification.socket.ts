import { INotification, Notification } from "../models/notification.model";

export class NotificationSocket {
    nsp: any;
    name: string;
    data: any;
    socket: any;

    /**
     * Constructor.
     *
     * @class NotificationSocket
     * @constructor
     * @param io any
     * @param name string
     */
    constructor(io: any, private stream: string) {
        this.nsp = io.of("/notifications/" + encodeURIComponent(this.stream));
        this.nsp.on("connection", (socket: any) => {
            console.log("Client connected to stream:", this.stream);
            this.socket = socket;
            this.listen();
        });
    }

    /**
     * Add signal
     *
     * @class NotificationSocket
     * @method listen
     * @return void
     */
    private listen(): void {
        this.socket.on("disconnect", () => this.disconnect());
        this.socket.on("create", (notification: INotification) => this.create(notification));
        this.socket.on("list", () => this.list());
    }

    /**
     * Handle disconnect
     *
     * @class NotificationSocket
     * @method disconnect
     * @return void
     */
    private disconnect(): void {
        console.log("Client disconnected from stream:", this.stream);
    }

    /**
     * Create a notification in a stream
     *
     * @class NotificationSocket
     * @method create
     * @param name string
     * @return void
     */
    private create(notification: INotification): void {
        Notification.create(notification, (error: any, notification: INotification) => {
            if (!error && notification) {
                this.nsp.emit("create", notification);
            }
        });
    }

    /**
     * List all notifications in a stream
     *
     * @class NotificationSocket
     * @method list
     * @return void
     */
    private list(): void {
        if (this.socket && this.socket.connected) {
            Notification
                .find({ stream: this.stream }) // Find notifications only on this stream
                .sort({ created: -1 }) // Sort newest notifications first
                .limit(25) // Limit to 25 first results
                .exec( 
                    (error: any, notifications: INotification[]) => {
                        for (let notification of notifications.reverse()) {
                            this.socket.emit("create", notification);
                        }
                    }
                );
        }
    }
}