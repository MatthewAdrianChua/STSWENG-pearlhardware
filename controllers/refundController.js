import { User } from '../model/userSchema.js';
import { Order } from '../model/orderSchema.js';
import { Refund } from '../model/refundSchema.js'
import { refundImage } from '../model/refundImages.js';
import { Product } from '../model/productSchema.js';

const refundController = {
    getRefund: function(req,res){
        try{
            res.render("refund_ticket_page", {
                layout: 'userprofile',
                script: '../js/refundTicketPage.js'
            })
        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },

    initiateRefund: async function(req,res){
        try{
            const {orderID, index, productID} = req.body;

            req.session.refundOrderID = orderID;
            req.session.refundItemIndex = index;
            req.session.productID = productID;

            console.log(req.session.refundOrderID);
            console.log(req.session.refundItemIndex)

            res.sendStatus(200);

        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },

    createRefund: async function(req,res){
        try{
            console.log("createRefund");

            const pic = req.files;
            const body = req.body;
            
            let imageArray = [];

            console.log(pic.length);
            console.log(body);

            for(let x = 0; x<pic.length; x++){
                const obj = {
                    img: {
                        data: new Buffer.from(pic[x].buffer, 'base64'),
                        contentType: pic[x].mimeType
                    }
                }
                const imageSave = await refundImage.create(obj);

                imageArray.push(imageSave._id);
                //console.log(imageSave);
            }

            const product = await Product.findById(req.session.productID);
            const order = await Order.findById(req.session.refundOrderID);
            const userID = await User.findById(req.session.userID);

            const createRefund = new Refund({
                userID: userID._id,
                itemID : product._id,
                orderID: order._id,
                itemName: product.name,
                price: product.price,
                amount: order.items[req.session.refundItemIndex].amount,
                totalAmount: parseFloat(product.price) * parseFloat(order.items[req.session.refundItemIndex].amount),
                reason: body.reason,
                comments: body.comments,
                evidence: imageArray,
                status: 'For review',
                paymongoRefundID: -1, //-1 means it has not been refunded yet
                denialReason: "",
            })

            //console.log(createRefund);

            const saveRefund = await createRefund.save();
            //console.log(saveRefund);

            const updateItem = await Order.findOneAndUpdate({_id: req.session.refundOrderID, 'items.index': parseInt(req.session.refundItemIndex) }, {
                $set: {'items.$.isRefunded': true}
            });

            res.redirect('/getRefund');
            //res.sendStatus(200);
        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },

    getAdminRefundDetails: async function(req,res){

        try{

            const refundID = req.params.refundID;
            console.log(refundID);

            const refund = await Refund.findById(refundID);
            const user = await User.findById(refund.userID);
            const order = await Order.findById(refund.orderID);

            const images = [];

            for(let x = 0; x < refund.evidence.length; x++){
                images.push('http://localhost:3000/refundImage/' + refund.evidence[x]);
            }

            console.log(order.paymentID)

            const userVerify = await User.findById(req.session.userID)
                if (userVerify.isAuthorized == true) {
                    console.log("AUTHORIZED")
                    res.render("admin_refund_details", {
                        layout: 'adminRefund',
                        script: '../js/adminRefundDetails.js',
                        refundID: refund._id,
                        email: user.email,
                        dateOfOrder: order.date,
                        dateOfRefund: refund.createdDate,
                        itemName: refund.itemName,
                        itemID: refund.itemID,
                        price: refund.price,
                        amount: refund.amount,
                        totalAmount: refund.totalAmount,
                        status: refund.status,
                        reason: refund.reason,
                        comments: refund.comments,
                        evidence: images,
                        paymentID: order.paymentID,
                        denialReason: refund.denialReason,
                    });
                } else {
                    console.log("UNAUTHORIZED");
                    res.sendStatus(400);
                }

        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },

    refundCustomer: async function(req,res){
        try{

            const paymongoAPIkey = process.env.paymongoKey;
            const {paymentID, refundID} = req.body;

            //console.log(paymentID);
            //console.log(refundID);

            const options = {
                method: 'POST',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  authorization: `Basic ${btoa(paymongoAPIkey)}`
                },
                body: JSON.stringify({
                  data: {
                    attributes: {amount: 5000, payment_id: paymentID, reason: 'others'}
                  }
                })
              };
              
              fetch('https://api.paymongo.com/refunds', options)
                .then(response => response.json())
                .then(async response => {
                    
                    console.log(response);

                    const updateRefund = await Refund.findByIdAndUpdate(refundID, {
                        status : 'Refund approved',
                        paymongoRefundID : response.data.id
                    }) 

                    //console.log(updateRefund);
                    
                    res.sendStatus(200);
                    //console.log(response)
                })
                .catch(err => console.error(err));

        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },

    denyRefund: async function(req,res){

        try{
    
            const {reasonString, refundID} = req.body;
            //console.log(reasonString);

            const update = await Refund.findByIdAndUpdate(refundID, {
                status: "Refund denied",
                denialReason: reasonString
            })

            res.sendStatus(200);

            }catch(error){
                console.error(error);
                res.sendStatus(400);
            }
        },

    getAdminRefundManagement: async function(req, res){

        try{
        const category = req.params.category;
        console.log(category)
        let resp;

        switch(category) {
            case 'refundApproved' :
                resp = (await Refund.find({status: "Refund approved"})).reverse();
                break;
            case 'refundDenied' :
                resp = (await Refund.find({status: "Refund denied"})).reverse();
                break;
            case 'forReview' :
                resp = await Refund.find({status: "For review"});
                break;
            default:
                resp = (await Refund.find()).reverse();
                break;
        }

        let refundList = []

        //console.log(resp);


        for(let x = 0; x<resp.length; x++){
            const user = await User.findById(resp[x].userID);

            refundList.push({
                refundID: resp[x]._id,
                date: resp[x].createdDate.toISOString().slice(0, 10),
                amountToBeRefunded: parseFloat(resp[x].price) * parseFloat(resp[x].amount),
                email: user.email,
                status: resp[x].status,
            })
        }

        //console.log(refundList);
        const userVerify = await User.findById(req.session.userID)
                if (userVerify.isAuthorized == true) {
                    console.log("AUTHORIZED")
                    res.render("admin_refund_management_page", {
                        layout: 'adminRefund',
                        script: '../js/adminRefundManagement.js',
                        refundList: refundList,
                        category:category,
                    });
                } else {
                    console.log("UNAUTHORIZED");
                    res.sendStatus(400);
                }
                
        //res.sendStatus(200);
    }catch(error){
        console.error(error);
        res.sendStatus(400);
    }
    },

    getUserRefundManagement: async function(req, res){

        try{
        const category = req.params.category;
        console.log(category)
        let resp;

        switch(category) {
            case 'refundApproved' :
                resp = (await Refund.find({status: "Refund approved", userID: req.session.userID})).reverse();
                break;
            case 'refundDenied' :
                resp = (await Refund.find({status: "Refund denied", userID: req.session.userID})).reverse();
                break;
            case 'forReview' :
                resp = await Refund.find({status: "For review", userID: req.session.userID});
                break;
            default:
                resp = (await Refund.find({userID : req.session.userID})).reverse();
                break;
        }

        let refundList = []

        //console.log(resp);


        for(let x = 0; x<resp.length; x++){
            const user = await User.findById(resp[x].userID);

            refundList.push({
                refundID: resp[x]._id,
                date: resp[x].createdDate.toISOString().slice(0, 10),
                amountToBeRefunded: parseFloat(resp[x].price) * parseFloat(resp[x].amount),
                email: user.email,
                status: resp[x].status,
            })
        }

        //console.log(refundList);

        res.render("user_refund_management_page", {
            layout: 'userRefund',
            script: '../js/userRefundManagement.js',
            refundList: refundList,
            category:category,
        })
        //res.sendStatus(200);
    }catch(error){
        console.error(error);
        res.sendStatus(400);
    }
    },

    getUserRefundDetails: async function(req,res){

        try{

            const refundID = req.params.refundID;
            console.log(refundID);

            const refund = await Refund.findById(refundID);
            const user = await User.findById(refund.userID);
            const order = await Order.findById(refund.orderID);

            const images = [];

            for(let x = 0; x < refund.evidence.length; x++){
                images.push('http://localhost:3000/refundImage/' + refund.evidence[x]);
            }

            console.log(order.paymentID)

            res.render("user_refund_details", {
                layout: 'userRefund',
                //script: '../js/userRefundDetails.js',
                refundID: refund._id,
                email: user.email,
                dateOfOrder: order.date,
                dateOfRefund: refund.createdDate,
                itemName: refund.itemName,
                itemID: refund.itemID,
                price: refund.price,
                amount: refund.amount,
                totalAmount: refund.totalAmount,
                status: refund.status,
                reason: refund.reason,
                comments: refund.comments,
                evidence: images,
                paymentID: order.paymentID,
                denialReason: refund.denialReason,
            })
        }catch(error){
            console.error(error);
            res.sendStatus(400);
        }
    },
}

export default refundController;