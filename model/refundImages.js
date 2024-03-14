import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const refundImageSchema = new Schema({
    img:
    {
        data: Buffer,
        contentType: String
    }
});

export const refundImage = mongoose.model('refundImage', refundImageSchema);