import cartController from '../controllers/cartController.js';
import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import database from '../model/db.js';
import { jest } from '@jest/globals';
import { beforeEach, describe } from 'node:test';

jest.useFakeTimers();

// Mocking the User and Product models
jest.mock('../model/userSchema.js', () => ({
    User: {
      find: jest.fn(),
      updateOne: jest.fn(),
    },
  }));
  
  jest.mock('../model/productSchema.js', () => ({
    Product: {
      find: jest.fn(),
    },
  }));
  
  // Mocking the request and response objects
  const reqWithUserID = {
    session: { userID: 'mockUserID', fName: 'John' },
    body: { id: 'mockProductID', quant: 1 },
  };
  
  const reqWithoutUserID = {
    session: {},
  };
  
  const res = {
    render: jest.fn(),
    sendStatus: jest.fn(),
  };
  
describe('Cart Controller', () => {
    //getCart
    describe('getCart', () => {
        // beforeEach(() => {
        //     jest.clearAllMocks();
        // });
    
        // it('should render cart if user is logged in and cart items exist', async () => {
        //     const mockCart = [
        //     { product: { _id: 'mockProductID1', price: 10 }, quantity: 2, uniqueID: 'uniqueID1' },
        //     { product: { _id: 'mockProductID2', price: 15 }, quantity: 1, uniqueID: 'uniqueID2' },
        //     ];
    
        //     // Mock User.find to return mockCart
        //     jest.spyOn(User, 'find').mockResolvedValueOnce([{ cart: mockCart }]);
    
        //     // Mock Product.find to return mock products
        //     jest.spyOn(Product, 'find').mockResolvedValueOnce([
        //         { _id: 'mockProductID1', isShown: true },
        //         { _id: 'mockProductID2', isShown: true },
        //     ]);
    
        //     await cartController.getCart(reqWithUserID, res);
    
        //     // Check if User.find is called with the correct parameter
        //     expect(User.find).toHaveBeenCalledWith({ _id: 'mockUserID' }, { cart: 1 });
    
        //     // Check if Product.find is called with the correct parameters
        //     expect(Product.find).toHaveBeenCalledWith(
        //     { _id: 'mockProductID1', isShown: true } // ObjectId converted
        //     );
    
        //     // Check if res.render is called with the correct parameters
        //     expect(res.render).toHaveBeenCalledWith('add_to_cart', {
        //     cart_result: mockCart,
        //     total: '35.00', // calculated total from mockCart prices and quantities
        //     script: './js/checkout.js',
        //     });
    
        //     // Check if res.sendStatus is not called
        //     expect(res.sendStatus).not.toHaveBeenCalled();
        // });
    
        // it('should render login page if user is not logged in', async () => {
        //     await cartController.getCart(reqWithoutUserID, res);
    
        //     // Check if res.render is called with the correct parameters
        //     expect(res.render).toHaveBeenCalledWith('login', { script: './js/login.js' });
    
        //     // Check if res.sendStatus is not called
        //     expect(res.sendStatus).not.toHaveBeenCalled();
        // });
    });   

    //addToCart
    describe('addToCart', () => {
        // beforeEach(() => {
        //     jest.clearAllMocks();
        //   });
      
        //   it('should add product to cart if user is logged in', async () => {
        //     const mockProduct = { _id: 'mockProductID', name: 'Mock Product' };
        //     const mockUser = { _id: 'mockUserID', cart: [] };
        //     const exisitingItem = [{cart: [{quantity: 1}] }];
      
        //     // Mock Product.find to return mock product
        //     jest.spyOn(Product, 'find').mockResolvedValueOnce([mockProduct]);

        //     // Mock User.find to return mock user
        //     jest.spyOn(User, 'find').mockResolvedValueOnce([mockUser]);

        //     //Mock the response for exisitingItem with a non-empty cart
        //     jest.spyOn(User, 'find').mockResolvedValueOnce(exisitingItem);
      
        //     // Call the function
        //     await cartController.addToCart(reqWithUserID, res);
      
        //     // Check if Product.find is called with the correct parameter
        //     expect(Product.find).toHaveBeenCalledWith({ _id: 'mockProductID' }, { __v: 0 });
      
        //     // Check if User.find is called with the correct parameter
        //     expect(User.find).toHaveBeenCalledWith({ _id: 'mockUserID' });
      
        //     // Check if User.updateOne is called with the correct parameter to add product to cart
        //     expect(User.updateOne).toHaveBeenCalledWith(
        //       { _id: 'mockUserID' },
        //       {
        //         $push: {
        //           cart: { product: mockProduct, quantity: 1, uniqueID: 'mockUserID:mockProductID' }
        //         }
        //       }
        //     );
      
        //     // Check if redirect is called
        //     expect(res.redirect).toHaveBeenCalledWith('/cart?');
        //   });
      
        //   it('should not add product to cart if user is not logged in', async () => {
        //     // Call the function
        //     await cartController.addToCart(reqWithoutUserID, res);
      
        //     // Check if Product.find is not called
        //     expect(Product.find).not.toHaveBeenCalled();
      
        //     // Check if User.find is not called
        //     expect(User.find).not.toHaveBeenCalled();
      
        //     // Check if User.updateOne is not called
        //     expect(User.updateOne).not.toHaveBeenCalled();
      
        //     // Check if redirect is not called
        //     expect(res.redirect).not.toHaveBeenCalled();
        //   });
    });

    //getCartItems
    describe('getCartItems', () => {
    
    });

    //removeFromCart
    describe('removeFromCart', () => {
    
    });
});
