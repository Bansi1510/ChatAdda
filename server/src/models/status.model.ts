import mongoose from "mongoose";

export interface IStatus {

}


const statusSchema = new mongoose.Schema<IStatus>({

}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);

export default Status