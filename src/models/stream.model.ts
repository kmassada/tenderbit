import * as mongoose from "mongoose";

export interface IStream {
    name: string;
    created: Date;
}

export interface IStreamModel extends IStream, mongoose.Document {}
 
export var StreamSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    created: Date
});

export var Stream = mongoose.model<IStreamModel>("Stream", StreamSchema);