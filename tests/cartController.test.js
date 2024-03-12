import cartController from '../controllers/cartController.js';
import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import database from '../model/db.js';
import { jest } from '@jest/globals';
import { beforeEach, describe } from 'node:test';

jest.useFakeTimers();

jest.mock('../model/userSchema.js');
jest.mock('../model/productSchema.js');
jest.mock('../model/db.js');

describe('Cart Controller', () => {
    //getCart
    describe('getCart function', () => {
        let req, res;
    
        beforeEach(() => {
          req = {
            session: {
              userID: '65dd295eee3132fa6b85c2b2',
              fName: 'TestOne',
            },
          };
    
          res = {
            render: jest.fn(),
          };
        });
    
        afterEach(() => {
          jest.clearAllMocks();
        });
    
        it('Should go to the cart page with the correct data', async () => {
          // Mock data
          const user = {
            _id: '65dd295eee3132fa6b85c2b2',
            fName: 'TestOne',
            cart: [
              {
                product: {
                  _id: '65dd277a12e1839879e499df',
                  name: 'Pipe Fittings',
                  price: 100,
                },
                quantity: 3,
              },
              {
                product: {
                  _id: '65dd277a12e1839879e499de',
                  name: 'Fan',
                  price: 199.99,
                },
                quantity: 1,
              },
            ],
          };
          const product1 = {
            _id: '65dd277a12e1839879e499df',
            name: 'Pipe Fittings',
            price: 100,
          };
          const product2 = {
            _id: '65dd277a12e1839879e499de',
            name: 'Fan',
            price: 199.99,
          };
    
          // Mock User.find to return the user
          User.find.mockResolvedValueOnce([user]);
    
          // Mock Product.find to return the correct products
          Product.find.mockResolvedValueOnce([product1]);
          Product.find.mockResolvedValueOnce([product2]);
    
          // Call the getCart function
          await cartController.getCart(req, res);
    
          // Verify that the cart page is rendered with the correct data
          expect(res.render).toHaveBeenCalledWith('add_to_cart', {
            cart_result: user.cart,
            total: (product1.price * user.cart[0].quantity) + (product2.price * user.cart[1].quantity),
            script: './js/checkout.js',
          });
        });
    
        it('Should go to the login page if the user is not logged in', async () => {
          req.session.userID = null;
    
          // Mock User.find to return an empty array
          User.find.mockResolvedValueOnce([]);
    
          // Call the getCart function
          await cartController.getCart(req, res);
    
          // Verify that the login page is rendered
          expect(res.render).toHaveBeenCalledWith('login', {
            script: './js/login.js',
          });
        });
      });

    // addToCart 
    describe('addToCart function', () => {
        let req, res;
    
        beforeEach(() => {
          req = {
            session: {
              userID: '65dd295eee3132fa6b85c2b2',
            },
            body: {
              id: '65dd277a12e1839879e499df',
              quant: 3,
            },
          };
    
          res = {
            redirect: jest.fn(),
          };
        });
    
        afterEach(() => {
          jest.clearAllMocks();
        });
    
        it('Should add the product to the user\'s cart', async () => {
          // Mock data
          const user = {
            _id: '65dd295eee3132fa6b85c2b2',
            cart: [
              {
                product: {
                  _id: '65dd277a12e1839879e499de',
                  name: 'Fan',
                  price: 199.99,
                },
                quantity: 1,
              },
            ],
          };
          const product = {
            _id: '65dd277a12e1839879e499df',
            name: 'Pipe Fittings',
            price: 100,
          };
    
          // Mock User.find to return the user
          User.find.mockResolvedValueOnce([user]);
    
          // Mock User.updateOne to add the product to the user's cart
          User.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });
    
          // Mock Product.find to return the correct product
          Product.find.mockResolvedValueOnce([product]);
    
          // Call the addToCart function
          await cartController.addToCart(req, res);
    
          // Verify that the user's cart is updated with the new product
          expect(User.updateOne).toHaveBeenCalledWith(
            { _id: req.session.userID, 'cart.product._id': { $ne: req.body.id } },
            { $push: { cart: { product: product, quantity: req.body.quant, uniqueID: req.session.userID + ":" + req.body.id } } },
            { safe: true, multi: false }
          );
    
          // Verify that the user is redirected to the cart page
          expect(res.redirect).toHaveBeenCalledWith('/cart?');
        });
    
        it('Should not add the product to the user\'s cart if the user is not logged in', async () => {
          req.session.userID = null;
    
          // Call the addToCart function
          await cartController.addToCart(req, res);
    
          // Verify that the user is not redirected to the cart page
          expect(res.redirect).not.toHaveBeenCalled();
        });
      });

    //getCartItems
    describe('getCartItems function', () => {
        let req, res;

        beforeEach(() => {
            req = {
                session: {
                    userID: '65dd295eee3132fa6b85c2b2'
                }
            };

            res = {
                status: jest.fn(() => res),
                send: jest.fn()
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should send the items in a user\'s cart', async () => {
            // Mock cart data
            const cartItems = [
                { product: { _id: '65dd277a12e1839879e499df', name: 'Pipe Fittings', price: 100 }, quantity: 3 },
                { product: { _id: '65dd277a12e1839879e499de', name: 'Fan', price: 199.99 }, quantity: 1 }
            ];

            // Mock User.find to return cart items
            User.find.mockResolvedValueOnce([{ cart: cartItems }]);

            // Call the getCartItems function
            await cartController.getCartItems(req, res);

            // Verify that the response status is set to 200
            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify that the cart items are sent in the response
            expect(res.send).toHaveBeenCalledWith(cartItems);
        });
    });

    //removeFromCart
    describe('removeFromCart function', () => {
        let req, res;
    
        beforeEach(() => {
          req = {
            session: {
              userID: '65dd295eee3132fa6b85c2b2',
            },
          };
    
          res = {
            redirect: jest.fn(),
          };
    
          // Mock User.find to return the user when the user is logged in
          User.find.mockResolvedValueOnce([{
            _id: req.session.userID,
            cart: [
              {
                product: {
                  _id: '65dd277a12e1839879e499df',
                  name: 'Pipe Fittings',
                  price: 100,
                },
                quantity: 3,
              },
            ],
          }]);
    
          // Mock User.find to return an empty array when the user is not logged in
          User.find.mockResolvedValueOnce([]);
    
          // Mock User.updateOne to remove the product from the user's cart
          User.updateOne.mockResolvedValueOnce({ modifiedCount: 1 });
        });
    
        afterEach(() => {
          jest.clearAllMocks();
        });
    
        it('Should remove the product from the user\'s cart', async () => {
          // Call the removeFromCart function
          await cartController.removeFromCart(req, res);
    
          // Verify that User.updateOne was called with the correct arguments
          expect(User.updateOne).toHaveBeenCalledWith(
            { _id: req.session.userID, 'cart.product._id': '65dd277a12e1839879e499df' },
            { $pull: { cart: { product: { _id: '65dd277a12e1839879e499df' } } } },
            { safe: true, multi: false }
          );
    
          // Verify that the user is redirected to the cart page
          expect(res.redirect).toHaveBeenCalledWith('/cart');
        });
    
        it('Should not redirect to the cart page if the user is not logged in', async () => {
          
        req.session.userID = null;

        // Call the removeFromCart function
        await cartController.removeFromCart(req, res);

        // Verify that the user is not redirected to the cart page
        expect(res.redirect).not.toHaveBeenCalled();
        });
    });
});
