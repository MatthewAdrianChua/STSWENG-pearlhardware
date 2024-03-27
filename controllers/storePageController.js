import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { User } from '../model/userSchema.js';
import Handlebars from 'handlebars';
import { formatPrice } from '../util/helpers.js';
import { Review } from "../model/reviewSchema.js";

Handlebars.registerHelper('formatPrice', formatPrice);

let currentCategory = "allproducts";
const pageLimit = 15;

const storePageController = {
	getIndex: async function (req, res) {
        try {
            console.log("USER ID" + req.session.userID);
            //getProducts function
            var product_list = await getProducts();

            // sortProducts function
            const sortValue = req.query.sortBy;
            sortProducts(product_list, sortValue);


            res.render("index", {
                product_list: product_list,
                script: './js/index.js',
                isHomePage: true,
            });
        } catch {
            res.sendStatus(400);
        }
    },
	getCategory: async function (req, res) {

        const category = req.params.category;
        //console.log("CATEGORY " + req.params.category);
        //console.log(currentCategory);
        if((req.session.pageIndex == null || currentCategory != category) && (category == 'allproducts' || category == 'welding' || category == 'safety' || category == 'cleaning' || category == 'industrial' || category == 'brassfittings')){
            //console.log("HERE");
            req.session.prevPage = false;
            req.session.nextPage = true;
            req.session.pageIndex = 0;
            currentCategory = category;
        }
        //console.log(req.session.pageIndex);

        try {

            //getProducts function
            var product_list = await getProducts(category, req);

            // sortProducts function
            const sortValue = req.query.sortBy;
            sortProducts(product_list, sortValue);

            res.render("all_products", {
                product_list: product_list,
                category: category,
                script: '/./js/sort.js',
                nextPage: req.session.nextPage,
                prevPage: req.session.prevPage

            });
        } catch {
            res.sendStatus(400);
        }

    },
	changePageStore: async function(req, res){

        try{

        let count;

        //console.log(req.body);

        const category = req.params.category.toLowerCase();
        //console.log(category);

        const {change} = req.body;
        //console.log(change);

        if(category == "welding" || category == "safety" || category == "cleaning" || category == "industrial" || category == "brassfittings"){
            count = await Product.find( {type:category} );
        }else{
            count = await Product.find({});
        }

        //console.log(count);

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
    getProductDesc: async function (req, res) {
        try {
            res.render("productDesc", {
            });
        } catch {
            res.sendStatus(400);
        }
    },
    
	//searchProducts
	searchProducts: async function(req,res){
		console.log("Searching for a product!");
		
		const query = req.query.product_query;
		
		console.log("Searching for " + query);
		
		const result = await Product.find({name: new RegExp('.*' + query + '.*', 'i'), isShown: true}, {__v:0}).lean();
		// sortProducts function
		const sortValue = req.query.sortBy;
		console.log(sortValue);
		sortProducts(result, sortValue);
		
		res.render("search_results", {product_list: result, buffer: query, script: '/./js/sort.js'});
    },
	//getproduct
    //using the product ID in the query, it will send the data to products.hbs to render
    //the webpage for that specific product
    getProduct: async function (req, res) {
        console.log("getting product!");
        var query = req.query.id;
		let sumRating = 0;
		let dateSplit;
        try {
            const product_result = await Product.find({ _id: query }, { __v: 0 }).lean();
			let reviews = await Review.find({productID: query}, {__v: 0}).lean();
			//Reviews are default sorted newest to oldest. Can be changed on a later date!
			reviews.sort((a, b) => b.dateCreated - a.dateCreated);
			
			let userReviewIndex = -1;
			for (let i = 0; i < reviews.length; i++){
				dateSplit = reviews[i].dateCreated.toString().split(" ");
				//console.log(reviews[i]);
				sumRating += reviews[i].rating;
				reviews[i].dateCreated = dateSplit[1] + ". " + dateSplit[2] + ", " + dateSplit[3] + " " + dateSplit[4]; 
				if(reviews[i].authorID == req.session.userID){
					console.log("FOUND REVIEW WRITTEN BY USER at " + i);
					userReviewIndex = i;
				}
			}
			
			let ratingAve = sumRating/reviews.length;
			let user_review;
			if(userReviewIndex != -1){
				user_review = reviews[userReviewIndex];
				let reviewsH = reviews.slice(0, userReviewIndex);
				let reviewsL = reviews.slice(userReviewIndex + 1);
				reviews = reviewsH.concat(reviewsL);
			}

            return res.render("productDesc", {
                product: product_result[0],
				user_review: user_review,
				review_list: reviews,
				ratingAve: ratingAve.toFixed(1),
				ratingNo: reviews.length,
                script: "./js/add_to_cart.js",
            });
        }
        catch { };
        res.render("product");

    },
}
//Helper functions
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

async function getProducts(category, req) {
    try{
		var product_list = [];
		let resp;
		let testNext;
		//console.log(category)
		switch (category) {
			case 'welding':
				resp = await Product.find({ type: category, isShown: true }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category, isShown: true }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'safety':
				resp = await Product.find({ type: category, isShown: true }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category, isShown: true }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);

				//testNext = await Order.find({isCancelled: false}).skip(req.session.pageIndex + 1 * pageLimit).limit(pageLimit).sort({date: dateVal});
				break;
			case 'cleaning':
				resp = await Product.find({ type: category, isShown: true}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category, isShown: true }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'industrial':
				resp = await Product.find({ type: category, isShown: true }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category, isShown: true }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			case 'brassfittings':
				resp = await Product.find({ type: category, isShown: true }).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({ type: category, isShown: true }).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
				break;
			default:
				resp = await Product.find({isShown: true}).skip(req.session.pageIndex * pageLimit).limit(pageLimit);
				testNext = await Product.find({isShown: true}).skip((req.session.pageIndex + 1) * pageLimit).limit(pageLimit);
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
			if (resp[i].isShown) {
				product_list.push({
					name: resp[i].name,
					type: resp[i].type,
					price: resp[i].price,
					quantity: resp[i].quantity,
					productpic: resp[i].productpic,
					p_id: resp[i]._id,
					description: resp[i].description
				});
			}
		}
		return product_list;
	}catch(error){
		console.error(error);
	}
}

export default storePageController;