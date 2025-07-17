import { model, Schema } from "mongoose";
import { IUser } from "../types";

const userSchema= new Schema<IUser>({
userName:{
    type:String,
    required:true,
    default:"Anonymous"
},
email:{
    type:String,
    required:true,
    unique:true,
},
password:{
    type:String,
    required:true
}
}, { timestamps: true });

export default model<IUser>("User",userSchema);