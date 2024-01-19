import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: true
    },
    
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [
            'user', 
            'admin',
            'premium'
        ],
        default: 'user'
    },
    tickets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tickets',
        },
    ],
    documents: [
        {
            name: {
                type: String,
                required: true,
            },
            reference: {
                type: String,
                required: true,
            },
            docType: {
                type: String,
                required: true
            }
        }
    ],
    last_connection: {
        type: Date,
        default: Date.now()
    }

})

export const UserModel = mongoose.model("User", UserSchema)