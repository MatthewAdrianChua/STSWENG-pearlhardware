import database from '../model/db.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User } from '../model/userSchema.js';

const SALT_WORK_FACTOR = 10;

const registerController = {
	getRegister: async function (req, res) {
        try {
            res.render("register", {
                script: './js/register.js'
            });
        } catch {
            res.sendStatus(400);
        }
    },
	register: async function (req, res) {

        const errors = validationResult(req);
        //console.log(errors)
        if (!errors.isEmpty()) {
            if (errors.array().at(0).msg === "Email already exists!") {
                console.log(errors.array().at(0).msg);
                return res.sendStatus(405); //405 is for email that exists already
            }else if (errors.array().at(0).msg === "Postal code should be 4 digits") {
                console.log(errors.array().at(0).msg + " of " + errors.array().at(0).path);
                return res.sendStatus(410); //405 is for email that exists already
            }else {
                console.log(errors.array().at(0).msg + " of " + errors.array().at(0).path);
                return res.sendStatus(406); //406 is for invalid email value
            }
        }

        console.log("Register request received");
        console.log(req.body);
        const { fname, lname, email, password, line1, line2, state, city, postalCode } = req.body

        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName: fname,
            lastName: lname,
            email: email,
            password: hash,
            line1: line1,
            line2: line2,
            city: city,
            state: state,
            postalCode: postalCode,
            country: "PH"
        });

        try {
            const result = await newUser.save();
            console.log(result);
            res.sendStatus(200);
        } catch (err) {
            console.log("Username already exists!");
            console.error(err);
            res.sendStatus(500);
        }
    },

}

export default registerController;