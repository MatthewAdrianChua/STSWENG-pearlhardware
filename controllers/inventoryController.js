import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { Image } from '../model/imageSchema.js';
import { User } from '../model/userSchema.js';
import Handlebars from 'handlebars';
import { formatPrice } from '../util/helpers.js';

Handlebars.registerHelper('formatPrice', formatPrice);

let currentCategory = "allproducts";
const pageLimit = 15;

const inventoryController = {
	getAdminInventory: async function (req, res) {

        const category = req.params.category;

        if((req.session.pageIndex == null || currentCategory != category) && (category == 'allproducts' || category == 'welding' || category == 'safety' || category == 'cleaning' || category == 'industrial' || category == 'brassfittings')){
            //console.log("HERE");
            req.session.nextPage = true;
            req.session.prevPage = false;
            req.session.pageIndex = 0;
            currentCategory = category;
        }

        try {
            let resp;
            var product_list = await getProductsAdmin(category, req);
			
            // sortProducts function
            const sortValue = req.query.sortBy;
            console.log(sortValue);
            sortProducts(product_list, sortValue);

            if (req.session.userID) {
                const user = await User.findById(req.session.userID)
                if (user.isAuthorized == true) {
                    console.log("AUTHORIZED")
                    res.render("adminInventory", {
                        layout: 'adminInven',
                        product_list: product_list,
                        script: '/./js/adminInventory.js',
                        category: category,
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

        } catch {
            res.sendStatus(400);
        }
    },
	addProduct: async function (req, res) {
        try {
            const pic = req.file;
            const product = req.body;

            //console.log("PRODUCT");
            //console.log(product);
    
            if (pic) {

                const obj = {
                    img: {
                        data: new Buffer.from(pic.buffer, 'base64'),
                        contentType: pic.mimeType
                    }
                }
                const imageSave = await Image.create(obj);
                
                new Product({
                    name: product.name,
                    type: product.type,
                    quantity: product.quantity,
                    price: product.price,
                    //productpic: 'https://pearl-hardware-ph.onrender.com/image/' + imageSave._id, //this this for production
                    productpic: 'http://localhost:3000/image/' + imageSave._id,
                    description: product.description
                }).save();

            }else {
                new Product({
                    name: product.name,
                    type: product.type,
                    quantity: product.quantity,
                    price: product.price,
                    productpic: './uploads/temp.png',
                    description: product.description
                }).save();
            }

            res.redirect('/adminInventory/' + product.type);
    
        }catch(err){
            console.error(err);
            res.sendStatus(400);
        }
    },
	editProduct: async function (req, res) {
        try {
            const pic = req.file;
            const product = req.body;

            if (pic) {

                const obj = {
                    img: {
                        data: new Buffer.from(pic.buffer, 'base64'),
                        contentType: pic.mimeType
                    }
                }

                const imageSave = await Image.create(obj);

                const updateStock = await Product.findByIdAndUpdate(
                    product.id,
                    { name: product.name,
                        type: product.type,
                        quantity: product.stock,
                        price: product.price,

                        //productpic: 'https://pearl-hardware-ph.onrender.com/image/' + imageSave._id, //use this for production
                        productpic: 'http://localhost:3000/image/' + imageSave._id, 
                        description: product.description
                    },
                    
                );
            }else{
                const updateStock = await Product.findByIdAndUpdate(
                    product.id,
                    { name: product.name,
                        type: product.type,
                        quantity: product.stock,
                        price: product.price,
                        description: product.description
                    },
                    
                );
            }

            res.redirect('/adminInventory/' + currentCategory);

        } catch {
            res.sendStatus(500);
        }
    },
	//searchInventory
	//specialized search and sort for Admin
    searchInventory: async function (req, res) {
        console.log("Searching in inventory!");
        var product_list = [];
        var query = req.query.product_query;


        console.log("Searching for " + query);

        //const resp = await Product.find({ name: new RegExp('.*' + query + '.*', 'i') }, { __v: 0 }).lean();
        const resp = await Product.find({ name: new RegExp('.*' + query + '.*', 'i') }, { __v: 0 });
        
        for (let i = 0; i < resp.length; i++) {
            product_list.push({
                name: resp[i].name,
                type: resp[i].type,
                price: resp[i].price,
                quantity: resp[i].quantity,
                productpic: resp[i].productpic,
                p_id: resp[i]._id
            });
            
        }

        // sortProducts function
        const sortValue = req.query.sortBy;
        console.log(sortValue);
        sortProducts(product_list, sortValue);

        res.render("adminInventory", { layout: 'adminInven', product_list: product_list, buffer: query });
    }
}
//Helper functions
export async function getProductsAdmin(category, req) {
    try{
		var product_list = [];
		let resp;
		let testNext;
		console.log("HERE")
		switch (category) {
			case 'welding':
				resp = await Product.find({ type: category}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'safety':
				resp = await Product.find({ type: category}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);

				//testNext = await Order.find({isCancelled: false}).skip(req.session.pageIndex + 1 * pageLimit).limit(pageLimit).sort({date: dateVal});
				break;
			case 'cleaning':
				resp = await Product.find({ type: category}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'industrial':
				resp = await Product.find({ type: category}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'brassfittings':
				resp = await Product.find({ type: category}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			default:
				resp = await Product.find({}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
		}

		//console.log(testNext)

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

		for (let i = 0; i < resp.length; i++) {
				product_list.push({
					name: resp[i].name,
					type: resp[i].type,
					price: resp[i].price,
					quantity: resp[i].quantity,
					productpic: resp[i].productpic,
					p_id: resp[i]._id,
					description: resp[i].description,
					isShown: resp[i].isShown
				});
		}
		return product_list;
	}catch(error){
		console.error(error);
	}
}

async function sortProducts(product_list, sortValue) {
    if (sortValue !== undefined) {
        switch (sortValue) {
            case 'def':

                break;
            case 'price_asc':
                product_list.sort((a, b) => a.price - b.price);

                break;
            case 'price_desc':
                product_list.sort((a, b) => b.price - a.price);
                break;
            case 'name_asc':
                product_list.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name_desc':
                product_list.sort((a, b) => b.name.localeCompare(a.name));
                break;
			case 'stock_asc':
				product_list.sort((a, b) => a.quantity - b.quantity);
				break;
			case 'stock_desc':
				product_list.sort((a, b) => b.quantity - a.quantity);
				break;			
        }
    }
}

export default inventoryController;