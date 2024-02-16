import database from '../model/db.js';
import { User } from '../model/userSchema.js';

import bcrypt from 'bcrypt';
const SALT_WORK_FACTOR = 10;

const loginController = {
	getLogin: async function (req, res) {
        try {
            res.render("login", {
                script: './js/login.js'
            });
        } catch {
            res.sendStatus(400);
        }
    },
	login: async function (req, res) {
        console.log(req.body);

        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser && await bcrypt.compare(req.body.password, existingUser.password) && existingUser.isAuthorized == false) {

            req.session.userID = existingUser._id;
            req.session.fName = existingUser.firstName;
            return res.sendStatus(200);
        } else if (existingUser && await bcrypt.compare(req.body.password, existingUser.password) && existingUser.isAuthorized == true) {
            req.session.userID = existingUser._id;
            req.session.fName = existingUser.firstName;
            return res.sendStatus(201);

        }
        console.log("Invalid email or password");
        res.sendStatus(500);

    },
}


export default loginController;