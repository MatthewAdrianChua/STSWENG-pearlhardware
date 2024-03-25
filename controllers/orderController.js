//This is the controller for orders in the admin view.
//This does not include the function for the orders for a user's view.
import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import { Order } from '../model/orderSchema.js';
import { ObjectId } from 'mongodb';
import { Product } from '../model/productSchema.js';
import mongoose from 'mongoose';

let currentCategory = "allproducts";
const pageLimit = 15;

const orderController = {
	getOrderDetails: async function (req, res) {

        const id = req.params.orderID
        //console.log(id);

        try {
            const order = await Order.findById(id);

            res.render("adminOrderDetails", {
                layout: 'adminMain',
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

                script: '/./js/adminOrderDetails.js',
            })

        } catch {
            res.sendStatus(400);
        }
    },
	//searchOrders
	//specialized search and sort for admin
	searchOrders: async function (req, res) {
        console.log("Searching for order!");

        var query = req.query.product_query;

        console.log("Searching for " + query);
	    var resp = undefined;
		var order_list = [];
        // sortOrders function
		const sortValue = req.query.sortBy;
        console.log(sortValue);
		try{	
			if (sortValue == "date_asc"){
				resp = await Order.find({ _id: query }, { __v: 0 }).sort({date: 'asc'});
			}
			else if (sortValue == "date_desc"){
				resp = await Order.find({ _id: query }, { __v: 0 }).sort({date: 'desc'});
			}
			else {
				resp = await Order.find({ _id: query }, { __v: 0 });
				sortOrders(resp, sortValue);
			}
			for(let i = 0; i < resp.length; i++) {
                order_list.push({
                    orderID: resp[i]._id,
                    firstName: resp[i].firstName,
                    lastName: resp[i].lastName,
                    email: resp[i].email,
                    date: resp[i].date.toISOString().slice(0,10),
					status: resp[i].status,
                    amount: resp[i].amount,
                    paymongoID: resp[i].paymongoID,
                    isCancelled: resp[i].isCancelled.toString()
                });
            }
            console.log("HERE")
            req.session.nextPage = false;
            req.session.prevPage = false;
            req.session.pageIndex = 0;
            currentCategory = "search";
            //res.sendStatus(200);
		}
		catch(error){
            //res.sendStatus(400);
            console.error(error);
		}
		res.render("adminOrders", {layout: 'adminMain',order_list: order_list, buffer: query, nextPage: req.session.nextPage, prevPage: req.session.prevPage, script: '/./js/adminOrders.js'});
    },
	
	cancelChange: async function (req, res) {
		const { id } = req.body;
		//console.log(id)

		try {
			const update = await Order.findByIdAndUpdate(id, { isCancelled: true });

			for (let x = 0; x < update.items.length; x++) { //this iterates through the items included in the order and adjusts the current stock of the products by subtracting it to what the user ordered
				try {
					const updateStock = await Product.findByIdAndUpdate(
						update.items[x].ID,
						{ $inc: { quantity: + update.items[x].amount } },
						{ new: true }
					);
					//console.log(updateStock)
				} catch {
					res.sendStatus(500);
				}
			}
			res.sendStatus(200);

		} catch {
			res.sendStatus(400);
		}    
    },
	statusChange: async function (req, res) {
        const { orderID, status } = req.body;
        //console.log(orderID)
        //console.log(status)

        try {
            const update = await Order.findByIdAndUpdate(orderID, { status: status });
            res.sendStatus(200);
        } catch {
            res.sendStatus(400);
        }
    },
	changePageAdminCategory: async function(req, res){
        try{
			let count;

			//console.log(req.body);

			const category = req.params.category;
			//console.log(category);

			const {change} = req.body;
			//console.log(change);

			if(category == "awaitingPayment" || category == "succeeded" || category == "orderPacked" || category == "inTransit" || category == "delivered"){
				count = await Order.find( {status : category} );
			}else if(category == "allOrders"){
				count = await Order.find( {isCancelled : false} );
			}else{
				count = await Order.find({});
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
	getAdminCategory: async function (req, res) {

        const category = req.params.category;
        //console.log(category);

        if((req.session.pageIndex == null || currentCategory != category) && (category == 'allOrders' || category == 'awaitingPayment' || category == 'succeeded' || category == 'orderPacked' || category == 'inTransit' || category == 'delivered' || category == 'cancelled')){
            //console.log("HERE");
            req.session.prevPage = false;
            req.session.nextPage = true;
            req.session.pageIndex = 0;
            currentCategory = category;
        }

        try {

            //getProducts function
            var order_list = [];
            let resp;
            let testNext;
			const sortValue = req.query.sortBy;
			//console.log("sort val = " + sortValue);
			var dateVal = undefined;
			if (sortValue == "date_asc"){
				dateVal = "desc";
			}
			else if (sortValue == "date_desc"){
				dateVal = "asc";
			}
			else {
				dateVal = "desc"; //defaults to showing dates from newest to oldest
			}
            switch(category){
                case 'allOrders':
                    resp = await Order.find({isCancelled: false}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({isCancelled: false}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
                default:
                    resp = await Order.find({status: category, isCancelled: false}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({status: category, isCancelled: false}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
                case 'cancelled':
                    resp = await Order.find({isCancelled: true}).skip(req.session.pageIndex * pageLimit).limit(pageLimit).sort({date: dateVal});
                    testNext = await Order.find({isCancelled: true}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit).sort({date: dateVal});
                    break;
            }

            if(testNext.length == 0)
                req.session.nextPage = false;
            else
                req.session.nextPage = true;
    
            if(req.session.pageIndex == 0)
                req.session.prevPage = false;
            else    
                req.session.prevPage = true;
    
            console.log(req.session.pageIndex);
            console.log(req.session.nextPage);
            console.log(req.session.prevPage);

            //console.log(resp.length)

            for(let i = 0; i < resp.length; i++) {
                order_list.push({
                    orderID: resp[i]._id,
                    firstName: resp[i].firstName,
                    lastName: resp[i].lastName,
                    email: resp[i].email,
                    date: resp[i].date.toISOString().slice(0, 10),
                    status: resp[i].status,
                    amount: resp[i].amount,
                    paymongoID: resp[i].paymongoID,
                    isCancelled: resp[i].isCancelled.toString(),
                });
            }
            
            // sortOrders function
			if (sortValue == "price_asc" || sortValue == "price_desc"){ 
				sortOrders(order_list, sortValue);
			}


            if (req.session.userID) {
                const user = await User.findById(req.session.userID)
                if (user.isAuthorized == true) {
                    console.log("AUTHORIZED")
                    res.render("adminOrders", {
                        layout: 'adminMain',
                        order_list: order_list,
                        category: category,
                        script: '/./js/adminOrders.js',
                        nextPage: req.session.nextPage,
                        prevPage: req.session.prevPage
                    });
                } else {
                    console.log("UNAUTHORIZED");
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);
            }
        } catch(error) {
            res.sendStatus(400);
            console.error(error)
        }

    }	
}
//Helper functions
async function sortOrders(order_list, sortValue){
    if (sortValue !== undefined) {
        switch (sortValue) {
            case 'def':
                break;
            case 'price_desc':
                order_list.sort((a, b) => b.amount - a.amount);
                break;
            case 'price_asc':
                order_list.sort((a, b) => a.amount - b.amount);
                break;		
        }
    }
}

export default orderController;