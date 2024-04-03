import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	
	//review id will be the autogenerated object id of 
	productID: String,  
	authorID: String,
	rating: Number,
	authorName: String,
	dateCreated: {
        type: Date, 
        default: Date.now()
    },
	dateUpdated: Date,
	header: String,
	body: String,
	images: Array

});

export const Review = mongoose.model('Review', reviewSchema);