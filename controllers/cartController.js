import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import Handlebars from 'handlebars';
import { formatPrice } from '../util/helpers.js';

Handlebars.registerHelper('formatPrice', formatPrice);


const cartController = {
	//getCart
    //gets the cart of the current user and renders the cart page.
    getCart: async function (req, res) {

        console.log("getting " + req.session.userID + "(" + req.session.fName + ")'s cart");

        let total = 0;
        let newResult = [];

        if (req.session.userID != null) {
            const result = await User.find({ _id: req.session.userID }, { cart: 1 });
            for(let x = 0; x < result[0].cart.length; x++){
                const result2 = await Product.find({ _id: result[0].cart[x].product._id, isShown: true})
                //console.log(result2);
                if(result2.length > 0){
                    total = total + (parseInt(result[0].cart[x].quantity) * result[0].cart[x].product.price);
                    newResult.push(result[0].cart[x]);
                }else{
                    await User.updateOne(
                        { _id: req.session.userID, cart: { $elemMatch: { uniqueID: result[0].cart[x].uniqueID } } },
                        {
                            $pull: {
                                cart: { uniqueID: result[0].cart[x].uniqueID }
                            }
                        }
                    );
                }
            }
            console.log(newResult);
            //console.log(result[0].cart);
            //console.log("Cart has been found? Can be accessed in handlebars using {{cart_result}}");
            res.render("add_to_cart", { cart_result: newResult, total: total.toFixed(2), script: './js/checkout.js' });
        } else {
            try {
                res.render("login", {
                    script: './js/login.js'
                });
            } catch {
                res.sendStatus(400);
            }
        }
    },
	//addToCart
    //will add to cart using the product ID (mongodb ID)
    addToCart: async function (req, res) {
        console.log("Adding to cart");
        console.log(req.body);
        console.log("Attempting to add: " + req.body.id);
		if(req.session.userID){
			const query = req.body.id;
			const temp = await Product.find({ _id: query }, { __v: 0 });
			const product_result = temp[0];
			var quant = req.body.quant;
			const id = req.session.userID + ":" + query;
			
			//see if user has product in the cart and get the quantity
			var existingItem = await User.find(
				{_id: req.session.userID, cart: { $elemMatch: { uniqueID: id } }},
				{_id: 0, 'cart.quantity.$': 1}
			);
			console.log(existingItem);

			if(existingItem.length !== 0 ){
				
				var currentQuantity = existingItem[0].cart[0].quantity;
				console.log(currentQuantity);
				console.log("Found something!");
				
				//Remove already existing item
				await User.updateOne(
					{ _id: req.session.userID, cart: { $elemMatch: { uniqueID: id} } },
					{
						$pull: {
							cart: { uniqueID: id }
						}
					}
				);
				
				console.log("Should have removed it!");
			}
			await User.updateOne(
				{ _id: req.session.userID },
				{
					$push: {
						cart: { product: product_result, quantity: quant, uniqueID: id }
					}
				}
			);
			
			//console.log(product_result);
			//console.log(user_cart[0].cart);

			//user_cart[0].cart.push(product_result);
			console.log("Should have added " + product_result.name + " to " + req.session.fName + "'s cart");
		}
        else{
			console.log("Not logged in! Nothing added.");
		}
		res.redirect("/cart?");
        
    },
	//sends the items in a user's cart 
    getCartItems: async function (req, res) {
        const result = await User.find({ _id: req.session.userID }, { cart: 1 });
        res.status(200).send(result[0].cart)
    },
	//removeFromCart
    //removes product from user cart using productID embedded in the link
    removeFromCart: async function (req, res) {
        console.log("removing product from cart");
        var query = req.query;
        console.log(query);

        //const product_result = await Product.find({ _id: query.id }, { __v: 0 });
        await User.updateOne(
            { _id: req.session.userID, cart: { $elemMatch: { uniqueID: query.uid } } },
            {
                $pull: {
                    cart: { uniqueID: query.uid }
                }
            }
        );
        res.redirect("/cart");
    },
}

export default cartController;
