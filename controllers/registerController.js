import database from '../model/db.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User } from '../model/userSchema.js';
import { Verification } from '../model/verificationSchema.js';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'

const SALT_WORK_FACTOR = 10;

//nodemailer
let transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: 'OAuth2',
		user: process.env.AUTH_EMAIL,
		pass: process.env.AUTH_PASS,
		clientId: process.env.OAUTH_CLIENTID,
		clientSecret: process.env.OAUTH_CLIENT_SECRET,
		refreshToken: process.env.OAUTH_REFRESH_TOKEN
	}
});

//test
transporter.verify((error,success) => {
	if (error) {
		console.log(error);
	} else {
		console.log("Ready for message");
		console.log("Success");
	}
});

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
			//send the email here
			sendVerificationEmail(result, res);
            res.sendStatus(200);
        } catch (err) {
            console.log("Username already exists!");
            console.error(err);
            res.sendStatus(500);
        }
    },
	resendVerification: async function(req, res) {
		try{
			const user = await User.findById(req.session.userID, {_id: 1, email: 1});
			console.log(user);
			if(user){
				sendVerificationEmail(user, res);
				console.log("Sent mail!");
				res.sendStatus(200);
			}
			else{
				console.log("Error resending email");
				//console.error(err);
				res.sendStatus(500);
			}
		}catch(err){
			console.log("Error resending email");
			console.error(err);
			res.sendStatus(500);
		}
	},

}

const sendVerificationEmail = async ({_id, email}, res) => {
	//url to be used in email
	const currentUrl = "http://localhost:3000/"
	const uniqueString = uuidv4() + _id;
	let url = currentUrl + "verify?t=" + _id + "&s="+ uniqueString;
	const mailOptions = {
		from: process.env.AUTH_EMAIL,
		to: email,
		subject: "Verify your email",
		html: `<p>Verify your email address to complete your signup</p>
				<br><p>This link will expire in <b>6 hours</6></p>
				<br><p>Verify email: 
				<br><a href=${url}>${url}</a></p>`
	}
	const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hash = await bcrypt.hash(uniqueString, salt);
	const newVerification  = new Verification({
		userID: _id,
		hash: hash,
		created: Date.now(),
		expires: Date.now() + 21600000 //6 hours from creation
	});
	try {
		const result = await newVerification.save();
		console.log(result);
		transporter.sendMail(mailOptions);
		console.log("Sent mail!");
		//res.sendStatus(200);
	} catch (err) {
		console.log("Error sending email!");
		console.error(err);
		//res.sendStatus(500);
	}
	
}

export default registerController;