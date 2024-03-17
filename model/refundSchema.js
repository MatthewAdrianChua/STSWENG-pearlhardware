import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const refundSchema = new Schema({

    userID: {
        type: String, 
        required:true
    },

    itemID: {
        type: String, 
        required: true, 
    },

    orderID: {
        type: String, 
        required:true
    },

    itemName: {
        type: String, 
        required: true, 
    },

    price: {
        type: Number, 
        required: true, 
    },

    amount: {
        type: Number,
        required: true,
    },

    totalAmount: {
        type: Number,
        required: true,
    },

    reason: {
        type: String,
        required: true,
    },

    comments: {
        type: String,
    },

    evidence:{
        type: mongoose.SchemaTypes.Array,
        required: true,
    },

    status: {
        type: String,
        required: true,
    },

    denialReason: {
        type: String,
    },

    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    },

    paymongoRefundID: {
        type: String,
        required: true,
    }

});

export const Refund = mongoose.model('Refund', refundSchema);