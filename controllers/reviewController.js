import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { User } from '../model/userSchema.js';
import { Review } from "../model/reviewSchema.js";

const reviewController = {
	addReviews: async function(req, res){
		//we should be able to pass a flag for anonymous reviews
		let {header, content, id, rating, anon} = req.body;

		const user = await User.findById(req.session.userID, {firstName: 1, lastName: 1});
		
		let authorName;
		if(anon == true){
			let anonFirstName = user.firstName[0] + user.firstName.slice(1).replace(/./g,"*");
			let anonLastName = user.lastName[0] + user.lastName.slice(1).replace(/./g,"*")
			authorName =  anonFirstName + " " + anonLastName;
		}
		else{
			authorName = user.firstName + " " + user.lastName;
		}
		
		if(user){
			let newReview = new Review({
				productID: id,
				authorID: req.session.userID,
				rating: rating,
				authorName: authorName,
				header: header,
				body: content,
				images: []
			});
			
			try {
				const result = await newReview.save();
				//console.log(result);
				res.sendStatus(200);
			} catch (err) {
				console.log("Error trying add review??");
				console.error(err);
				res.sendStatus(500);
			}
		}
		
		
	},
	editReviews: async function(req, res){
		let { id, header, content, rating, anon} = req.body;
		
		const user = await User.findById(req.session.userID, {firstName: 1, lastName: 1});		
		
		let authorName;
		if(anon == true){
			let anonFirstName = user.firstName[0] + user.firstName.slice(1).replace(/./g,"*");
			let anonLastName = user.lastName[0] + user.lastName.slice(1).replace(/./g,"*")
			authorName =  anonFirstName + " " + anonLastName;
		}
		else{
			authorName = user.firstName + " " + user.lastName;
		}
		
		Review.updateOne(
			{productID: id, authorID: req.session.userID},
			{
				header: header,
				body: content,
				authorName: authorName,
				rating: rating,
				dateUpdated: Date.now()
			}
		).then(() => {
			res.sendStatus(200);
		})
		.catch((e) => {
			console.log("Error trying to edit review");
			console.error(e);
			res.sendStatus(500);
		});
	},
	delReviews: async function(req, res){
		let { id } = req.body;
		Review.deleteOne({productID: id, authorID: req.session.userID})
			.then(() => {
				res.sendStatus(200);
			})
			.catch((e) => {
				console.log("Error trying to delete review");
				console.error(e);
				res.sendStatus(500);
			});
	}
};

export default reviewController;