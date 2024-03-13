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
            res.render("emailVerify", {
                //change script here; did not change it for now
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
			
			//console.log("uid =" + uid);
			//console.log("uis =" + uis);
			const verification = await Verification.find({userID: uid});
			console.log(verification);
			if (verification.length > 0){
				const {expires} = verification[0]; //THIS MAY BE WRONG!!
				
				if(expires < Date.now()){ //expired
					Verification.deleteOne({userID: uid})
						.then(result => {
							User.delete({_id: uid}).then(() => {console.log("Link has expired! Sign up again.")})
								.catch((error) => {console.log("Error deleting user")});
						})
						.catch((error) => {console.log("Error deleting verification record!"); /*WE SHOULD REDIRECT FROM HERE*/});
				}
				else{
					const {hash} = verification[0]; //MAY ALSO BE WRONG HOW DOES THIS WORK?
					console.log("hash= "+ hash);
					const cmp = await bcrypt.compare(uis, hash);
					console.log("test = " + cmp);
					if(cmp){
						console.log("Here1");
						User.findByIdAndUpdate(uid, {isVerified: true})
								.then(() =>{
									console.log("Here3");
									Verification.deleteOne({userID: uid})
									.then(() => {
										//redirect to a success page
										/*
										res.render("verifySuccess");
										*/
										res.redirect("/");
									})
									.catch((error) => {console.log("Error deleting verification record!"); /*WE SHOULD REDIRECT FROM HERE*/});
								})
								.catch((error) => {console.log("Invalid link! USER NOT FOUND"); /*WE SHOULD REDIRECT FROM HERE*/})
						console.log("Here2");
					}
					else{
						console.log("Invalid link! HASH FAILED");/*WE SHOULD REDIRECT FROM HERE */
					}
				}
			
			}	else{
				console.log("No valid record was found or has been verified already! Please sign up or log in.");
				//render an error.
			}
		}	catch {
			//redirect to an error, for now, just redirect back to emailVerify
			console.log("An error has occurred trying to verify user!");
			res.render("emailVerify", {
				script: './js/emailVerify.js'
			});
		}
		
	}
}

export default emailVerificationController;