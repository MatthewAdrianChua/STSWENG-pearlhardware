/*
*   This is the controller for email verification of a new user
*/

import exp from 'constants';
import database from '../model/db.js';
import { User } from '../model/userSchema.js';

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
			//read query verify?
			var uid = req.query;
			
		}	catch {
			//redirect to an error, for now, just redirect back to emailVerify
			res.render("emailVerify", {
				script: './js/emailVerify.js'
			});
		}
		
	}
}

export default emailVerificationController;