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
    }
}

export default emailVerificationController;