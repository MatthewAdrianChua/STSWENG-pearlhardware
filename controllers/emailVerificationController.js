/*
*   This is the controller for email verification of a new user
*/

import exp from 'constants';
import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import bcrypt from 'bcrypt';
import { Verification } from '../model/verificationSchema.js';

const emailVerificationController = {
	getEmailVerify: async function (req, res) {
        try {
			let skipped = false;
			if(String(req.query.sk) == "true"){
				skipped = true;
			}
			res.render("emailVerify", {
				skipped: skipped,
				script: './js/emailVerify.js'
			});
        } catch {
            res.sendStatus(400);
        }
    },
	//Handles the actual verification
	getVerify: async function (req, res) {
		try {
			//read query
			let uid = req.query.t
			let uis = req.query.s;

			const verification = await Verification.find({userID: uid});
			console.log(verification);
			if (verification.length > 0){
				const {expires} = verification[0];
				
				if(expires < Date.now()){ //expired
					Verification.deleteOne({userID: uid})
						.then(result => {
							User.delete({_id: uid})
								.then(() => {
									console.log("Link has expired! Sign up again.");
									renderErrorPage(res, uid, "Verification link has expired! Press the button below to recieve another verification email.");
								})
								.catch((error) => {
									console.log("Error deleting user");
									renderErrorPage(res, uid, "Error verifying account! Please try again. Error code: 32", 32);
								});
						})
						.catch((error) => {
							console.log("Error deleting verification record!"); 
							renderErrorPage(res, uid, "Error verifying account! Please try again. Error code: 33", 33);
						});
				}
				else{
					const {hash} = verification[0];
					const cmp = await bcrypt.compare(uis, hash);
					if(cmp){
						User.findByIdAndUpdate(uid, {isVerified: true})
								.then(() =>{
									Verification.deleteOne({userID: uid})
									.then(() => { //SUCCESS
										res.redirect("/");
									})
									.catch((error) => {
										console.log("Error deleting verification record!");
										renderErrorPage(res, uid, "Error verifying account! Please try again. Error code: 34", 34);
									});
								})
								.catch((error) => {
									console.log("Invalid link! USER NOT FOUND");
									renderErrorPage(res, uid, "Error verifying account! Please try again. Error code: 35", 35);
									})
					}
					else{
						console.log("Invalid link! HASH FAILED");
						renderErrorPage(res, uid, "Error verifying account! Please try again. Error code: 36", 36);
					}
				}
			
			}	else{
				console.log("No valid record was found or has been verified already! Please sign up or log in.");
				renderErrorPage(res, uid, "No valid record was found or has been verified already! Please sign up or log in.", 37);
			}
		}	catch {
			let uid = req.query.t;
			console.log("No valid record was found or has been verified already! Please sign up or log in.");
			renderErrorPage(res, uid, "No valid record was found or has been verified already! Please sign up or log in.", 37);
		}
		
	}
}

function renderErrorPage(res, uid, err, err_code = 0){
	
	//delete verification records of a user if error, so that we don't conflict multiple records of the same user.
	Verification.deleteMany({userID: uid})
	.then()
	.catch((error) => {
		console.log("Error deleting verification record!");
		renderErrorPage(res, "Error verifying account! Please try again. Error code: 34", 34);
	});
	
	res.render("emailVerify", {
		error: true,
		err_message: err,
		err_code: err_code,
		script: './js/emailVerify.js'
	});
}

export default emailVerificationController;