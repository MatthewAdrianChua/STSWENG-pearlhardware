import { Router } from "express";

import controller from '../controllers/controllers.js';
import loginController from '../controllers/loginController.js';
import registerController from '../controllers/registerController.js';
import cartController from '../controllers/cartController.js';
import checkoutController from '../controllers/checkoutController.js';
import userController from '../controllers/userController.js';
import adminController from '../controllers/adminController.js';
import storePageController from '../controllers/storePageController.js';
import inventoryController from '../controllers/inventoryController.js';
import orderController from '../controllers/orderController.js';
import refundController from '../controllers/refundController.js';

import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import { User } from '../model/userSchema.js';

import multer from 'multer';
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

const router = Router();

//BOILERPLATE
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//GETS
router.get(`/`, storePageController.getIndex);

//  user handling
router.get(`/login`, loginController.getLogin);
router.get('/register', registerController.getRegister);

router.get(`/category/:category`, storePageController.getCategory);
router.get(`/adminCategory/:category`, orderController.getAdminCategory); //iffy

router.get('/searchProducts', storePageController.searchProducts);


router.get('/userprofile', userController.getUserProfile);
router.get('/userpurchases/:status', userController.getUserPurchases);
router.get('/userorderdetails/:orderID', userController.getUserOrderDetails);
router.get('/userSearchPurchases', userController.searchUserPurchases);

//router.get('/searchProducts', controller.searchProducts); Possible duplicate

router.get('/image/:id', controller.image);
router.get('/refundImage/:id', controller.refundImage);

router.get('/checkout', checkoutController.checkout);
router.get('/checkoutSuccess/:orderID', checkoutController.checkoutSuccess);
router.get('/getUser', userController.getUser);
router.get('/productDesc', storePageController.getProductDesc);
router.get('/cart', cartController.getCart);
router.get('/logout', userController.logout);
router.get('/product', storePageController.getProduct);

router.get('/adminInventory/:category', inventoryController.getAdminInventory);
router.get('/searchInventory', inventoryController.searchInventory);
router.get('/remove-from-cart', cartController.removeFromCart);
router.get('/admin', adminController.getAdmin);
router.get('/getCartItems', cartController.getCartItems)
router.get('/AdminOrderDetails/:orderID', orderController.getOrderDetails)
router.get('/searchOrders', orderController.searchOrders);
router.get('/getRefund', refundController.getRefund);
router.get('/getAdminRefundManagement/:category', refundController.getAdminRefundManagement);
router.get('/getAdminRefundDetails/:refundID', refundController.getAdminRefundDetails);
router.get('/getUserRefundManagement/:category', refundController.getUserRefundManagement);
router.get('/getUserRefundDetails/:refundID', refundController.getUserRefundDetails);

//POSTS
router.post('/register', body('fname').notEmpty(), body('lname').notEmpty(), body('email').notEmpty().isEmail().normalizeEmail().custom(async value => {
    if (await User.findOne({ email: value }).exec()) {
        return Promise.reject('Email already exists!')
    }
}), body('password').notEmpty(), body('line1').notEmpty(), body('state').notEmpty(), body('city').notEmpty(), body('postalCode').notEmpty().isNumeric().custom(async value => {
    if(value.toString().length != 4){
        return Promise.reject('Postal code should be 4 digits')
    }
}),  registerController.register);

router.post('/login', body('email').notEmpty().normalizeEmail().isEmail(), body('password').notEmpty(), loginController.login);
router.post('/postCheckout', checkoutController.postCheckout);
router.post('/add-to-cart', cartController.addToCart);
router.post('/cancelChange', orderController.cancelChange);
router.post('/statusChange', orderController.statusChange);
router.post('/changePageStore/:category', storePageController.changePageStore);
router.post('/changePageAdminCategory/:category', orderController.changePageAdminCategory);
router.post('/changePageUserPurchases/:category', userController.changePageUserPurchases);

router.post('/addProduct', upload.single('productPic'), body('name').notEmpty(), body('quantity').notEmpty().isNumeric(), body('price').notEmpty(), inventoryController.addProduct);
router.post('/editProduct', upload.single('productPic'), body('name').notEmpty(), body('quantity').notEmpty().isNumeric(), body('price').notEmpty(), inventoryController.editProduct);
router.post('/showProduct', controller.showProduct);
router.post('/hideProduct', controller.hideProduct);
router.post('/deleteProduct', controller.deleteProduct);
router.post('/editProfile/:id', userController.editProfile);
router.post('/initiateRefund', refundController.initiateRefund);
router.post('/createRefund', upload.array('productPic', 10), body('name').notEmpty(), body('quantity').notEmpty().isNumeric(), body('price').notEmpty(), refundController.createRefund);
router.post('/refundCustomer', refundController.refundCustomer);
router.post('/denyRefund', refundController.denyRefund);


export default router;
