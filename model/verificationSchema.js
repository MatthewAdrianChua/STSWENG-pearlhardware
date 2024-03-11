import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const verificationSchema = new Schema({

    userEmail: String,
	hash: String,
	created: Date,
	expires: Date

});

export const Verification = mongoose.model('Verification', verificationSchema);