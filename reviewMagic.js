import mongoose from "mongoose";

import { Review } from "./model/reviewSchema.js";

//change this to the env
await mongoose.connect('mongodb://127.0.0.1:27017/pearl_hardware_test', { useNewUrlParser: true, useUnifiedTopology: true });

createReviews();
console.log("Process can be terminated safely now");

function createReviews(){
    const reviews = [];
    reviews.push(new Review({
        productID: "656acc2a3eaab0ba817e9849",
		authorID: "65f2483deb3a2c3488b29aa0",
		rating: 4,
		authorName: "nat asd",
		header: "Is glove",
		body: "I really like these gloves",
		images: []
    }));
	
	reviews.push(new Review({
        productID: "656acc2a3eaab0ba817e9849",
		authorID: "655d8e9d2feb9658adf538a1",
		rating: 2,
		authorName: "hashedNew new",
		header: "Is glove????",
		body: "I am no sure",
		images: []
    }));
	
	reviews.push(new Review({
        productID: "656acc2a3eaab0ba817e984a", //Glasses //Safety
		authorID: "655d8e9d2feb9658adf538a1",
		rating: 5,
		authorName: "hashedNew new",
		header: "This one is for sure not glove",
		body: "I am very sure",
		images: []
    }));
    

    for (let i = 0; i < reviews.length; i++) {
		try{
			reviews[i].save();
			console.log("Saved succesfully");
		} catch{
			console.log("It died");
		}
    }
}

