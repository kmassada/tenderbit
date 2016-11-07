import * as mongoose from "mongoose";

export interface INotification {
    stream: string;
    type: string;
    success: boolean;
    created: Date;
    notification: string;
}

export interface INotificationModel extends INotification, mongoose.Document {}
 
export var NotificationSchema = new mongoose.Schema({
    stream: {
        type: String,
        index: true
    },
    type: String,
    success: Boolean,
    created: Date,
    notification: String
});

export var Notification = mongoose.model<INotificationModel>("Notification", NotificationSchema);