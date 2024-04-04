import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import { Order } from '../model/orderSchema.js';
import { body, validationResult } from 'express-validator';

const checkoutController = {
	checkout: async function (req, res) {
        try {
            res.render("checkout", {
                script: './js/checkout.js'
            })

        } catch {
            res.sendStatus(400);
        }
    },
	//NOTE READ: WHEN BEING REDIRECTED AFTER SUCCESSFUL PAYMENT DO NOT CLICK AWAY FROM WEBSITE REDIRECT BACK FOR THE STATUS TO BE UPDATED

    postCheckout: async function (req, res) { //gets all the items in the cart using its mongodb id then adds them all up for a total to be redirected and paid in paymongo website using paymongo api
        //console.log(req.body);      
        const { items, amount } = req.body
        const paymongoAPIkey = process.env.paymongoKey;

        let total = 0; //the total amount the user has to pay

        class itemDetails {
            constructor(name, price, amount, image, ID, index) {
                this.name = name;
                this.price = price;
                this.amount = amount;
                this.image = image;
                this.ID = ID;
                this.isRefunded = false;
                this.index = index;
            }
        }

        const itemsCheckout = [] //an array containing the _id of the products the user added in the cart
        const itemsDetails = [] //an array containing the product names the user added to their cart
        const user = await User.findById(req.session.userID).exec();
        //console.log(user);

        for (let i = 0; i < items.length; i++) { //this for loop loops through the itemsCheckout array and for each one finds it in the product schema and creates an item checkout object needed in the api call
            const item = await Product.findById(items[i])
            //console.log("URL"+ item.productpic)
            itemsCheckout.push({
                currency: 'PHP',
                images: [item.productpic],
                amount: parseInt(parseFloat(item.price.toFixed(2)) * 100),
                description: 'description',
                name: item.name,
                quantity: parseInt(amount[i])
            })
            itemsDetails.push(new itemDetails(item.name, item.price, amount[i], item.productpic, item._id, i));
            total += item.price * parseInt(amount[i]);
        }

        try {
            if (parseFloat(total.toFixed(2)) > 20.00) {
                const order = new Order({
                    userID: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    items: itemsDetails,
                    date: Date.now(),
                    status: 'awaitingPayment',
                    amount: parseFloat(total.toFixed(2)),
                    paymongoID: -1, //paymongoID of -1 means there is no record of a transaction in paymongo in other words it is to be ignored as the user did not even go to the checkout page of paymongo
                    paymentID: -1,
                    line1: user.line1,
                    line2: user.line2,
                    city: user.city,
                    state: user.state,
                    postalCode: user.postalCode,
                    country: user.country,
                    isCancelled: false
                })

                const result = await order.save(); //save order to database
                //console.log(result);

                const options = {
                    method: 'POST',
                    headers: { accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(paymongoAPIkey)}` },
                    body: JSON.stringify({
                        data: {
                            attributes: {
                                billing: {
                                    address: {
                                        line1: user.line1,
                                        line2: user.line2,
                                        city: user.city,
                                        state: user.state,
                                        postal_code: user.postalCode,
                                        country: user.country
                                    }, name: user.firstName + ' ' + user.lastName, email: user.email
                                },
                                send_email_receipt: false,
                                show_description: false,
                                show_line_items: true,
                                //cancel_url: 'https://pearl-hardware-ph.onrender.com', //THIS LINE IS FOR PRODUCTION
                                cancel_url: 'http://localhost:3000/', //THIS IS FOR LOCAL TESTING
                                description: 'description',
                                line_items: itemsCheckout,
                                payment_method_types: ['card', 'gcash'],
                                reference_number: result._id, //store the order _id in database as the reference number
                                //success_url: 'https://pearl-hardware-ph.onrender.com/checkoutSuccess/' + result._id //THIS LINE IS FOR PRODUCTION 
                                success_url: 'http://localhost:3000/checkoutSuccess/' + result._id //THIS IS FOR LOCAL TESTING
                            }
                        }
                    })
                };

                fetch('https://api.paymongo.com/v1/checkout_sessions', options) //this api call is to create a checkout session in paymongo
                    .then(response => response.json())
                    .then(async response => {
                        console.log(response)
                        for (let x = 0; x < items.length; x++) { //this iterates through the items included in the order and adjusts the current stock of the products by subtracting it to what the user ordered
                            try {
                                const updateStock = await Product.findByIdAndUpdate(
                                    itemsDetails[x].ID,
                                    { $inc: { quantity: - itemsDetails[x].amount } },
                                    { new: true }
                                );
                                //console.log(updateStock)
                            } catch {
                                res.sendStatus(500);
                            }
                        }

                        const addPaymongoID = await Order.findByIdAndUpdate(response.data.attributes.reference_number, { paymongoID: response.data.id }); //after redirecting to paymongo the paymongoID is updated using the paymongo generated id

                        res.status(200);
                        res.send(response.data.attributes.checkout_url.toString());
                    })
                    .catch(err => console.error(err));
            } else {
                console.log("INVALID AMOUNT")
                res.sendStatus(401);
            }
        } catch (err) {
            console.log("Placing order failed!");
            console.error(err);
            res.sendStatus(500);
        }
    },
	checkoutSuccess: async function (req, res) { //this is to update the order in the database, as of now only 2 status' exist (Awaiting payment, succeeded)
        const paymongoAPIkey = process.env.paymongoKey;

        const options = { method: 'GET', headers: { accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(paymongoAPIkey)}` } };

        const ID = req.params.orderID;
        //console.log("Order ID: ", ID);

        const order = await Order.findById(ID);
        fetch('https://api.paymongo.com/v1/checkout_sessions/' + order.paymongoID, options) //this api call is to retrieved the checkout information in paymongo
            .then(response => response.json())
            .then(async response => { //console.log(response)
                try {
                    delete req.session.guestInfo;
                    req.session.save();
                    //console.log(req.session.guestInfo.fname)
                    //console.log(response.data.attributes.payments[0].id);
                    const result = await Order.findByIdAndUpdate(ID, {
                        status: response.data.attributes.payment_intent.attributes.status,
                        line1: response.data.attributes.billing.address.line1,
                        line2: response.data.attributes.billing.address.line2,
                        postalCode: response.data.attributes.billing.address.postal_code,
                        city: response.data.attributes.billing.address.city,
                        state: response.data.attributes.billing.address.state,
                        country: response.data.attributes.billing.address.country,
                        email: response.data.attributes.billing.email,
                        paymentID: response.data.attributes.payments[0].id
                    }); //update the status of the order in database using the status in paymongo
                    const user = await User.findByIdAndUpdate(req.session.userID, { cart: [] }) //clears the cart of the user after successfully checking out
                } catch (err) {
                    console.log("Fetching order failed!");
                    console.error(err);
                    res.sendStatus(500);
                }
            })
            .catch(err => console.error(err));

        try {
            if(req.session.userID)
                res.redirect('/userorderdetails/' + ID);
            else
                res.redirect('/guestorderdetails/' + ID);

        } catch {
            res.sendStatus(400);
        }
    },

    buyNow: async function(req,res){

        console.log("BUYNOW")
        const{quant, id} = req.body;
        const paymongoAPIkey = process.env.paymongoKey;
        const itemsCheckout = [] //an array containing the _id of the products the user added in the cart
        const itemsDetails = [] //an array containing the product names the user added to their cart
        let total = 0; //the total amount the user has to pay
        class itemDetails {
            constructor(name, price, amount, image, ID, index) {
                this.name = name;
                this.price = price;
                this.amount = amount;
                this.image = image;
                this.ID = ID;
                this.isRefunded = false;
                this.index = index;
            }
        }

        if(req.session.userID){

            try {

                const item = await Product.findById(id)

                const user = await User.findById(req.session.userID).exec();

                itemsCheckout.push({
                    currency: 'PHP',
                    images: [item.productpic],
                    amount: parseInt(parseFloat(item.price.toFixed(2)) * 100),
                    description: 'description',
                    name: item.name,
                    quantity: parseInt(quant)
                })
                itemsDetails.push(new itemDetails(item.name, item.price, quant, item.productpic, item._id, 0));
                total += item.price * parseInt(quant);

                if (parseFloat(total.toFixed(2)) > 20.00) {
                    const order = new Order({
                        userID: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        items: itemsDetails,
                        date: Date.now(),
                        status: 'awaitingPayment',
                        amount: parseFloat(total.toFixed(2)),
                        paymongoID: -1, //paymongoID of -1 means there is no record of a transaction in paymongo in other words it is to be ignored as the user did not even go to the checkout page of paymongo
                        paymentID: -1,
                        line1: user.line1,
                        line2: user.line2,
                        city: user.city,
                        state: user.state,
                        postalCode: user.postalCode,
                        country: user.country,
                        isCancelled: false
                    })
    
                    const result = await order.save(); //save order to database
                    //console.log(result);
    
                    const options = {
                        method: 'POST',
                        headers: { accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(paymongoAPIkey)}` },
                        body: JSON.stringify({
                            data: {
                                attributes: {
                                    billing: {
                                        address: {
                                            line1: user.line1,
                                            line2: user.line2,
                                            city: user.city,
                                            state: user.state,
                                            postal_code: user.postalCode,
                                            country: user.country
                                        }, name: user.firstName + ' ' + user.lastName, email: user.email
                                    },
                                    send_email_receipt: false,
                                    show_description: false,
                                    show_line_items: true,
                                    //cancel_url: 'https://pearl-hardware-ph.onrender.com', //THIS LINE IS FOR PRODUCTION
                                    cancel_url: 'http://localhost:3000/', //THIS IS FOR LOCAL TESTING
                                    description: 'description',
                                    line_items: itemsCheckout,
                                    payment_method_types: ['card', 'gcash'],
                                    reference_number: result._id, //store the order _id in database as the reference number
                                    //success_url: 'https://pearl-hardware-ph.onrender.com/checkoutSuccess/' + result._id //THIS LINE IS FOR PRODUCTION 
                                    success_url: 'http://localhost:3000/checkoutSuccess/' + result._id //THIS IS FOR LOCAL TESTING
                                }
                            }
                        })
                    };
    
                    fetch('https://api.paymongo.com/v1/checkout_sessions', options) //this api call is to create a checkout session in paymongo
                        .then(response => response.json())
                        .then(async response => {
                            console.log("OKAY")
            
                                try {
                                    const updateStock = await Product.findByIdAndUpdate(
                                        itemsDetails[0].ID,
                                        { $inc: { quantity: - itemsDetails[0].amount } },
                                        { new: true }
                                    );
                                    //console.log(updateStock)
                                } catch(error) {
                                    console.error(error);
                                    res.sendStatus(500);
                                }
    
                            const addPaymongoID = await Order.findByIdAndUpdate(response.data.attributes.reference_number, { paymongoID: response.data.id }); //after redirecting to paymongo the paymongoID is updated using the paymongo generated id
    
                            res.status(200);
                            res.send(response.data.attributes.checkout_url.toString());
                            //console.log("OKAY")
                            //res.redirect(response.data.attributes.checkout_url.toString())
                        })
                        .catch(err => console.error(err));
                } else {
                    console.log("INVALID AMOUNT")
                    res.sendStatus(401);
                }
            } catch (err) {
                console.log("Placing order failed!");
                console.error(err);
                res.sendStatus(500);
            }
        }else if(req.session.guestInfo){
            console.log("Guest info present")

            try {

                console.log({quant, id});
                const item = await Product.findById(id)

                itemsCheckout.push({
                    currency: 'PHP',
                    images: [item.productpic],
                    amount: parseInt(parseFloat(item.price.toFixed(2)) * 100),
                    description: 'description',
                    name: item.name,
                    quantity: parseInt(quant)
                })
                itemsDetails.push(new itemDetails(item.name, item.price, quant, item.productpic, item._id, 0));
                total += item.price * parseInt(quant);

                if (parseFloat(total.toFixed(2)) > 20.00) {
                    const order = new Order({
                        userID: "GUEST USER",
                        firstName: req.session.guestInfo.fname,
                        lastName: req.session.guestInfo.lname,
                        email: req.session.guestInfo.email,
                        items: itemsDetails,
                        date: Date.now(),
                        status: 'awaitingPayment',
                        amount: parseFloat(total.toFixed(2)),
                        paymongoID: -1, //paymongoID of -1 means there is no record of a transaction in paymongo in other words it is to be ignored as the user did not even go to the checkout page of paymongo
                        paymentID: -1,
                        line1: req.session.guestInfo.line1,
                        line2: req.session.guestInfo.line2,
                        city: req.session.guestInfo.city,
                        state: req.session.guestInfo.state,
                        postalCode: req.session.guestInfo.postalCode,
                        country: "PH",
                        isCancelled: false
                    })
    
                    const result = await order.save(); //save order to database
                    //console.log(result);
    
                    const options = {
                        method: 'POST',
                        headers: { accept: 'application/json', 'Content-Type': 'application/json', 'Authorization': `Basic ${btoa(paymongoAPIkey)}` },
                        body: JSON.stringify({
                            data: {
                                attributes: {
                                    billing: {
                                        address: {
                                            line1: req.session.guestInfo.line1,
                                            line2:req.session.guestInfo.line2,
                                            city: req.session.guestInfo.city,
                                            state: req.session.guestInfo.state,
                                            postal_code: req.session.guestInfo.postalCode,
                                            country: "PH"
                                        }, name: req.session.guestInfo.fname + ' ' + req.session.guestInfo.lname, email: req.session.guestInfo.email
                                    },
                                    send_email_receipt: false,
                                    show_description: false,
                                    show_line_items: true,
                                    //cancel_url: 'https://pearl-hardware-ph.onrender.com', //THIS LINE IS FOR PRODUCTION
                                    cancel_url: 'http://localhost:3000/', //THIS IS FOR LOCAL TESTING
                                    description: 'description',
                                    line_items: itemsCheckout,
                                    payment_method_types: ['card', 'gcash'],
                                    reference_number: result._id, //store the order _id in database as the reference number
                                    //success_url: 'https://pearl-hardware-ph.onrender.com/checkoutSuccess/' + result._id //THIS LINE IS FOR PRODUCTION 
                                    success_url: 'http://localhost:3000/checkoutSuccess/' + result._id //THIS IS FOR LOCAL TESTING
                                }
                            }
                        })
                    };
    
                    fetch('https://api.paymongo.com/v1/checkout_sessions', options) //this api call is to create a checkout session in paymongo
                        .then(response => response.json())
                        .then(async response => {
                            console.log(response)
            
                                try {
                                    const updateStock = await Product.findByIdAndUpdate(
                                        itemsDetails[0].ID,
                                        { $inc: { quantity: - itemsDetails[0].amount } },
                                        { new: true }
                                    );
                                    //console.log(updateStock)
                                } catch(error) {
                                    console.error(error);
                                    res.sendStatus(500);
                                }
    
                            const addPaymongoID = await Order.findByIdAndUpdate(response.data.attributes.reference_number, { paymongoID: response.data.id }); //after redirecting to paymongo the paymongoID is updated using the paymongo generated id
    
                            res.status(200);
                            res.send(response.data.attributes.checkout_url.toString());
                            //console.log(response.data.attributes.checkout_url.toString())
                            //res.redirect(response.data.attributes.checkout_url.toString())
                        })
                        .catch(err => console.error(err));
                } else {
                    console.log("INVALID AMOUNT")
                    res.sendStatus(401);
                }
            } catch (err) {
                console.log("Placing order failed!");
                console.error(err);
                res.sendStatus(500);
            }
        }else{
            const item = await Product.findById(id)
            total += item.price * parseInt(quant);
            req.session.buyNow = {quant : quant, id: id, total: total}
            res.sendStatus(202);
        }
    },

    getGuestDetails: async function (req, res){
        try{

            console.log(req.session.buyNow)
            const product = await Product.findById(req.session.buyNow.id);

            res.render("guestPurchase", {
                layout: 'main',
                script: '../js/guestPurchase.js',
                itemName: product.name,
                itemID : product._id,
                price: product.price,
                amount: req.session.buyNow.quant,
                totalAmount: req.session.buyNow.total,
            });
            console.log("NO INFO")
        } catch(error) {
            console.error(error);
            res.sendStatus(400);
        }
    },

    initializeGuest: async function(req,res){

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (errors.array().at(0).msg === "Postal code should be 4 digits") {
                console.log(errors.array().at(0).msg + " of " + errors.array().at(0).path);
                return res.sendStatus(410); 
            }else {
                console.log(errors.array().at(0).msg + " of " + errors.array().at(0).path);
                return res.sendStatus(406); //406 is for invalid email value
            }
        }

        const{fname, lname, email, line1, line2, city, state, postalCode} = req.body;

        req.session.guestInfo = {
            fname: fname,
            lname: lname,
            email: email,
            line1: line1,
            line2: line2,
            city: city,
            state: state,
            postalCode: postalCode
        }

        res.sendStatus(200);
        
    }
};

export default checkoutController;