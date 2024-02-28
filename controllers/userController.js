//This controller is for the user operations
//but not including login and registering.
import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import { Order } from '../model/orderSchema.js';
import { ObjectId } from 'mongodb';

let currentCategory = "allproducts";
const pageLimit = 15;

const userController = {
	//Gets the profile of the user using the session.userID
	getUserProfile: async function (req, res) {
        try {
            
            const user = await User.findById(req.session.userID);
            let userData = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilepic: user.profilepic,
                cart: user.cart,
                line1: user.line1,
                line2: user.line2,
                city: user.city,
                state: user.state,
                postalCode: user.postalCode,
                country: user.country,
            }
            console.log(userData);
            res.render("userprofile", {
                layout: 'userprofile',
                user: userData,
                script: './js/userProfile.js'
            });
        } catch {
            res.sendStatus(400);
        }
    },
	
	//I have no clue what this is supposed to do.
	getUser: async function (req, res) {
        if (req.session.userID) {
            console.log("USER ID" + req.session.userID);
            res.status(200).send(req.session.userID.toString());
        } else {
            res.sendStatus(400);
            console.log("Failed to get current user");
        }
    },
	
	//Gets the purchase history of a customer
	getUserPurchases: async function (req, res) {

        const category = req.params.status;

        if((req.session.pageIndex == null || currentCategory != category) && (category == 'allOrders' || category == 'awaitingPayment' || category == 'succeeded' || category == 'orderPacked' || category == 'inTransit' || category == 'delivered' || category == 'cancelled')){
            //console.log("HERE");
            req.session.prevPage = false;
            req.session.nextPage = true;
            req.session.pageIndex = 0;
            currentCategory = category;
        }

        try {
            let resp;
            let testNext;
            var orders = [];
			
			const sortValue = req.query.sortBy;
			//console.log("sort val = " + sortValue);
			let dateVal;
			let priceVal;
			//I DON'T KNOW WHY THEY'RE reversed
			//PLEASE KNOW THAT
			//DESC = Newest to Oldest
			//ASC = Oldest to Newest			
			if(sortValue == "date_asc" || sortValue == "date_desc" || sortValue == null){
				//console.log("Should be here for: " + sortValue);
				if (sortValue == "date_desc"){
					dateVal = "asc";
				}
				else{
					dateVal = "desc";
				}
				switch(category){
					case 'allOrders':
						resp = await Order.find({isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
						testNext = await Order.find({isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
						break;
					default:
						resp = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
						testNext = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
						break;
					case 'cancelled':
						resp = await Order.find({isCancelled: true, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
						testNext = await Order.find({isCancelled: true, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
						break;
				}
			}
			else if(sortValue == "price_asc" || sortValue == "price_desc"){
				//console.log("Should be here for: " + sortValue);
				if (sortValue == "price_asc"){
					priceVal = "asc";
				}
				else if (sortValue == "price_desc"){
					priceVal = "desc";
				}
				switch(category){
					case 'allOrders':
						resp = await Order.find({isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({amount: priceVal});
						testNext = await Order.find({isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({amount: priceVal});
						break;
					default:
						resp = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({amount: priceVal});
						testNext = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({amount: priceVal});
						break;
					case 'cancelled':
						resp = await Order.find({isCancelled: true, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({amount: priceVal});
						testNext = await Order.find({isCancelled: true, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({amount: priceVal});
						break;
				}
			}
			
            /*switch(category){
                case 'allOrders':
                    resp = await Order.find({isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
                default:
                    resp = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({status: category, isCancelled: false, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
                case 'cancelled':
                    resp = await Order.find({isCancelled: true, userID: req.session.userID}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({isCancelled: true, userID: req.session.userID}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
            }*/

            if(testNext.length == 0)
                req.session.nextPage = false;
            else
                req.session.nextPage = true;
    
            if(req.session.pageIndex == 0)
                req.session.prevPage = false;
            else    
                req.session.prevPage = true;
    
            //console.log(req.session.pageIndex);
            //console.log(req.session.nextPage);
            //console.log(req.session.prevPage);

            //console.log(resp)
            for(let i = 0; i < resp.length; i++) {
                orders.push({
                    orderID: resp[i]._id,
                    firstName: resp[i].firstName,
                    lastName: resp[i].lastName,
                    email: resp[i].email,
                    date: resp[i].date.toISOString().slice(0, 10),
                    status: resp[i].status,
                    amount: resp[i].amount,
                    items: resp[i].items.length,
                    paymongoID: resp[i].paymongoID,
                    isCancelled: resp[i].isCancelled.toString()
                });
            }
			
            res.render("userpurchases", {
                layout: 'userOrders',
                script: '/./js/userPurchases.js',
                orders: orders,
                category: category,
                nextPage: req.session.nextPage,
                prevPage: req.session.prevPage
            });

        } catch(error) {
            res.sendStatus(400);
            console.error(error);
        }
    },
	//specialized search for user orders
	searchUserPurchases: async function(req,res){
		console.log("Searching for order!");

        var query = req.query.product_query;

        console.log("Searching for " + query);
	    var resp = undefined;
		let testNext;
		var orders = [];
        // sortOrders function
		const sortValue = req.query.sortBy;
        console.log(sortValue);
		try{
			const id = new mongoose.Types.ObjectId(query);
			console.log(id);
			if (sortValue == "date_asc"){
				resp = await Order.find({userID: req.session.userID, _id: id }, { __v: 0 }).sort({date: 'asc'}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).lean();
				//testNext = await Order.find({userID: req.session.userID, _id: id }, { __v: 0 }).sort({date: 'asc'}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).lean();
			}   
			else if (sortValue == "date_desc"){
				resp = await Order.find({userID: req.session.userID, _id: id }, { __v: 0 }).sort({date: 'desc'}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).lean();
				//testNext = await Order.find({userID: req.session.userID, _id: id }, { __v: 0 }).sort({date: 'desc'}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).lean();
			}
			else {
				resp = await Order.find({userID: req.session.userID, _id: id }, { __v: 0 }).skip(req.session.pageIndex * pageLimit).limit(pageLimit).lean();
				sortOrders(resp, sortValue);
			}
			for(let i = 0; i < resp.length; i++) {
                orders.push({
                    orderID: resp[i]._id,
                    firstName: resp[i].firstName,
                    lastName: resp[i].lastName,
                    email: resp[i].email,
                    date: resp[i].date.toISOString().slice(0, 10),
                    status: resp[i].status,
                    amount: resp[i].amount,
                    items: resp[i].items.length,
                    paymongoID: resp[i].paymongoID,
                    isCancelled: resp[i].isCancelled.toString()
                });
            }
			if(testNext.length == 0)
                req.session.nextPage = false;
            else
                req.session.nextPage = true;
    
            if(req.session.pageIndex == 0)
                req.session.prevPage = false;
            else    
                req.session.prevPage = true;
		}
		catch{
			console.log("Failed!");
		}
		res.render("userpurchases", {
			layout: 'userOrders',
			orders: orders,
			buffer: query,
			script: '/./js/userPurchases.js',
			nextPage: req.session.nextPage,
			prevPage: req.session.prevPage
		});
	},
	editProfile: async function (req, res) {
        try {
            const user = req.body;
            const id = req.params.id;

            //console.log(id);

            const updateProfile = await User.findByIdAndUpdate(
                id,
                { firstName: user.fname,
                    lastName: user.lname,
                    state: user.state,
                    city: user.city,
                    postalCode: user.postalCode,
                    line1: user.line1,
                    line2: user.line2
                },   
            );

            //console.log(updateProfile)
            
            res.redirect('/userprofile');

        } catch(error) {
            res.sendStatus(400);
            console.error(error);
        }
    },
	logout: async function (req, res) {
        console.log("Logging out!");
        req.session.destroy();
        res.redirect('/');
    },
	getUserOrderDetails: async function(req, res) {

        const orderID = req.params.orderID;

        try{

            const order = await Order.findById(orderID);

            res.render("userorderdetails", {
                layout: 'userOrders',
                orderID: order._id,
                orderDate: order.date,
                fname: order.firstName,
                lname: order.lastName,
                email: order.email,
                status: order.status,
                city: order.city,
                postalCode: order.postalCode,
                state: order.state,
                line1: order.line1,
                line2: order.line2,
                isCancelled: order.isCancelled,
                items: order.items,
                amount: order.amount,
                paymongoID: order.paymongoID,
            });
        } catch {
            res.sendStatus(400);
        }
    },
	changePageUserPurchases: async function(req, res){

        try{

			let count;

			//console.log(req.body);

			const category = req.params.category;
			//console.log(category);

			const {change} = req.body;
			//console.log(change);

			if(category == "awaitingPayment" || category == "succeeded" || category == "orderPacked" || category == "inTransit" || category == "delivered"){
				count = await Order.find( {status : category, userID : req.session.userID, isCancelled: false} );
			}else if(category == "allOrders"){
				count = await Order.find( {isCancelled : false, userID : req.session.userID} );
			}else{
				count = await Order.find({userID : req.session.userID, isCancelled: true});
			}

			if(change == "next"){
				req.session.pageIndex = req.session.pageIndex + 1;
			}else if(change == "prev"){
				req.session.pageIndex = req.session.pageIndex - 1;
			}else{
				console.log("error fetching page");
			}

			if(req.session.pageIndex < 0 || req.session.pageIndex > Math.round(count.length / pageLimit)){
				console.log("HERE");
				req.session.pageIndex = 0;
			}

			currentCategory = category;

			res.sendStatus(200);
        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }

    },
}

export default userController;