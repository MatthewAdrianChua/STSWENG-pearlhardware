import cartController from '../controllers/cartController.js';
import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import database from '../model/db.js';
import { jest } from '@jest/globals';
import { beforeEach, describe } from 'node:test';

jest.useFakeTimers();

// jest.mock('../model/userSchema');
// jest.mock('../model/productSchema');
// Mocking dependencies
jest.mock('../model/db.js', () => ({
    User: {
        find: jest.fn(),
        updateOne: jest.fn(),
    },
}));
jest.mock('../model/userSchema.js', () => ({
    User: jest.fn(),
}));
jest.mock('../model/productSchema.js', () => ({
    Product: {
        find: jest.fn(),
    },
}));

describe('cartController', () => {
  describe('getCart', () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
          session: { userID: 'mockUserID', fName: 'John' }
      };
      res = {
          render: jest.fn(),
          sendStatus: jest.fn()
      };
      jest.clearAllMocks();
    });

    // it('should render cart if user is logged in and cart items exist', async () => {
    //   const mockCart = [
    //     { product: { _id: 'mockProductID1', price: 10 }, quantity: 2, uniqueID: 'uniqueID1' },
    //     { product: { _id: 'mockProductID2', price: 15 }, quantity: 1, uniqueID: 'uniqueID2' },
    //   ];

    //   jest.spyOn(User, 'find').mockResolvedValueOnce([{ cart: mockCart }]);

    //   jest.spyOn(Product, 'find').mockResolvedValueOnce([{ _id: 'mockProductID1', isShown: true }]);

    //   jest.spyOn(Product, 'find').mockResolvedValueOnce([]); // Simulate product not found for the second cart item

    //   await cartController.getCart(req, res);

    //   expect(User.find).toHaveBeenCalledWith({ _id: 'mockUserID' }, { cart: 1 });

    //   expect(Product.find).toHaveBeenCalledWith({ _id: 'mockProductID1', isShown: true });

    //   expect(Product.find).toHaveBeenCalledWith({ _id: 'mockProductID2', isShown: true });

    //   expect(res.render).toHaveBeenCalledWith('add_to_cart', {
    //     cart_result: [{ product: { _id: 'mockProductID1', price: 10 }, quantity: 2, uniqueID: 'uniqueID1' }],
    //     total: '20.00',
    //     script: './js/checkout.js'
    //   });
    // });

    // it('should render login page if user is not logged in', async () => {
    //   req.session.userID = null;

    //   await cartController.getCart(req, res);

    //   expect(res.render).toHaveBeenCalledWith('login', { script: './js/login.js' });
    // });

    // it('should handle errors when rendering login page', async () => {
    //   req.session.userID = null;
    //   res.render.mockImplementationOnce(() => { throw new Error('Render error'); });

    //   await cartController.getCart(req, res);

    //   expect(res.sendStatus).toHaveBeenCalledWith(400);
    // });
    test('should render login page if user is not logged in', async () => {
        const req = { session: { userID: null } };
        const res = {
            render: jest.fn().mockImplementation((view) => {
                expect(view).toBe('login');
                return res;
            }),
            sendStatus: jest.fn(),
        };

        await cartController.getCart(req, res);

        expect(res.render).toHaveBeenCalledWith('login', { script: './js/login.js' });
    });

    // test('should render add_to_cart page if userID is not null and cart items are found', async () => {
    //     const req = { session: { userID: 'user123' } };
    //     const res = {
    //         render: jest.fn().mockImplementation((view, data) => {
    //             expect(view).toBe('add_to_cart');
    //             expect(data.cart_result).toHaveLength(1); // Assuming there's one item in the cart for the test
    //             expect(data.total).toBe('10.00'); // Assuming total is $10.00 for the test
    //             expect(data.script).toBe('./js/checkout.js');
    //             return res;
    //         }),
    //     };

    //     // Mocking User.find to return mock cart data
    //     const mockCartData = [{ product: { _id: 'product123', price: 10 }, quantity: 1 }];
    //     require('../model/db.js').User.find.mockResolvedValue([{ cart: mockCartData }]);

    //     // Mocking Product.find to return found product
    //     require('../model/productSchema.js').Product.find.mockResolvedValue([{ _id: 'product123', isShown: true }]);

    //     await cartController.getCart(req, res);

    //     expect(res.render).toHaveBeenCalled();
    // });

  });

  //addToCart
//   describe('addToCart', () => {

//   });

//   //getCartItems
//   describe('getCartItems', () => {
//     let req;
//     let res;

//     beforeEach(() => {
//         req = { session: { userID: 'mockUserID' } };
//         res = {
//             status: jest.fn().mockReturnThis(),
//             send: jest.fn()
//         };
//         jest.clearAllMocks();
//     });

//     it('should send items in user\'s cart if user is logged in', async () => {
//         const mockCartItems = [
//             { product: { _id: 'mockProductID1', name: 'Product 1', price: 10 }, quantity: 2 },
//             { product: { _id: 'mockProductID2', name: 'Product 2', price: 15 }, quantity: 1 }
//         ];
//         jest.spyOn(User, 'find').mockResolvedValueOnce([{ cart: mockCartItems }]);
    
//         await cartController.getCartItems(req, res);

//         expect(User.find).toHaveBeenCalledWith({ _id: 'mockUserID' }, { cart: 1 });
//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(res.send).toHaveBeenCalledWith(mockCartItems);
//     });

//     it('should send status 400 if user is not logged in', async () => {
//         req.session.userID = undefined;

//         await cartController.getCartItems(req, res);

//         expect(User.find).not.toHaveBeenCalled();
//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.send).toHaveBeenCalledWith('User not logged in');
//     });
//   });

  //removeFromCart
//   describe('removeFromCart', () => {
//     let req;
//     let res;

//     beforeEach(() => {
//         req = {
//         session: {
//             userID: '123',
//         },
//         query: {
//             uid: '456',
//         },
//         };
//         res = {
//         redirect: jest.fn(),
//         };

//         // Mock the User model
//         User.updateOne = jest.fn().mockResolvedValue({
//         matchedCount: 1,
//         modifiedCount: 1,
//         });
//     });

//     it('should remove product from user cart and redirect to /cart', async () => {
//         await cartController.removeFromCart(req, res);

//         expect(User.updateOne).toHaveBeenCalledWith(
//         {
//             _id: '123',
//             cart: { $elemMatch: { uniqueID: '456' } },
//         },
//         {
//             $pull: {
//             cart: { uniqueID: '456' },
//             },
//         }
//         );
//         expect(res.redirect).toHaveBeenCalledWith('/cart');
//     });

//     it('should do nothing if product not found in user cart', async () => {
//         User.updateOne = jest.fn().mockResolvedValue({
//         matchedCount: 0,
//         modifiedCount: 0,
//         });

//         await cartController.removeFromCart(req, res);

//         expect(User.updateOne).toHaveBeenCalled();
//         expect(res.redirect).not.toHaveBeenCalled();
//     });

//     it('should send 400 if user is not logged in', async () => {
//         req.session = null;

//         await cartController.removeFromCart(req, res);

//         expect(res.sendStatus).toHaveBeenCalledWith(400);
//     });
//   });
});

