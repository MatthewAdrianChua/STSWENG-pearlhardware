import userController from '../controllers/userController';
import database from '../model/db';
import { User } from '../model/userSchema';
import { Order } from '../model/orderSchema';
import { ObjectId } from 'mongodb';
import Handlebars from 'handlebars';
import { formatPrice } from '../util/helpers.js';
import {jest} from '@jest/globals'
import { describe } from 'node:test';

jest.useFakeTimers()

// Mocking the User model
jest.mock('../model/userSchema.js', () => ({
    User: {
      findById: jest.fn(),
    },
  }));
  
  // Mocking the request and response objects
  const req = {
    session: { userID: 'mockUserID', },
  };
  
  const res = {
    render: jest.fn(),
    sendStatus: jest.fn(),
  };

describe('User Controller', () => {
  // getUserProfile
  describe('getUserProfile', () => {
    beforeEach(() => {
      // Clear mock calls between tests
      jest.clearAllMocks();
    });

    it('should render user profile if user is found', async () => {
      // Mock user data
      const mockUser = {
        _id: 'mockUserID',
        firstName: 'Jay',
        lastName: 'Park',
        email: 'jay.park@example.com',
        profilepic: 'profile.jpg',
        cart: [],
        line1: 'test street',
        line2: 'test village',
        city: 'Pasay',
        state: 'NCR',
        postalCode: '1234',
        country: 'PH',
      };
      // Mock the behavior of User.findById
      jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser);

      // Call the function
      await userController.getUserProfile(req, res);

      // Check if User.findById is called with the correct parameter
      expect(User.findById).toHaveBeenCalledWith('mockUserID');

      // Check if render is called with the correct parameters
      expect(res.render).toHaveBeenCalledWith('userprofile', {
        layout: 'userprofile',
        user: {
            id: 'mockUserID',
            firstName: 'Jay',
            lastName: 'Park',
            email: 'jay.park@example.com',
            profilepic: 'profile.jpg',
            cart: [],
            line1: 'test street',
            line2: 'test village',
            city: 'Pasay',
            state: 'NCR',
            postalCode: '1234',
            country: 'PH',
        },
        script: './js/userProfile.js',
      });

      // Check if sendStatus is not called
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should send status 400 if user is not found', async () => {
      // Mock the behavior of User.findById
      User.findById.mockResolvedValueOnce(null);

      // Call the function
      await userController.getUserProfile(req, res);

      // Check if User.findById is called with the correct parameter
      expect(User.findById).toHaveBeenCalledWith('mockUserID');

      // Check if sendStatus is called with 400
      expect(res.sendStatus).toHaveBeenCalledWith(400);

      // Check if render is not called
      expect(res.render).not.toHaveBeenCalled();
    });

  });

  //getUser
  describe('getUser', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { 
            session: { 
                userID: 'mockUserID' // Mock user ID
            }
        };
        res = { 
            status: jest.fn(() => res),
            send: jest.fn(),
            sendStatus: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should send user ID if user is logged in', async () => {
        // Call the function
        await userController.getUser(req, res);

        // Check if res.status and res.send are called with the correct parameters
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith('mockUserID');
    });

    it('should send status 400 if user is not logged in', async () => {
        // Set user ID to null to simulate user not logged in
        req.session.userID = null;

        // Call the function
        await userController.getUser(req, res);

        // Check if res.sendStatus is called with 400
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });

  });
  
  //getUserPurchases
  describe('getUserPurchases', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { 
            session: { 
                userID: 'mockUserID', 
                pageIndex: null // Initial page index
            }, 
            params: { 
                status: 'allOrders' // Initial category
            },
            query: {} // No query initially
        };
        res = { 
            render: jest.fn(),
            sendStatus: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should render user purchases for all orders with default sorting', async () => {
        const mockOrders = [
            {
                _id: 'mockOrderID1',
                firstName: 'Jay',
                lastName: 'Park',
                email: 'jay.park@example.com',
                date: new Date(),
                status: 'succeeded',
                amount: 100,
                items: [{}, {}], // Mock items
                paymongoID: 'mockPaymongoID1',
                isCancelled: false
            },
            {
                _id: 'mockOrderID2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                date: new Date(),
                status: 'delivered',
                amount: 150,
                items: [{}], // Mock items
                paymongoID: 'mockPaymongoID2',
                isCancelled: false
            }
        ];

        // Mock the behavior of Order.find
        jest.spyOn(Order, 'find').mockResolvedValueOnce(mockOrders);

        // Call the function
        await userController.getUserPurchases(req, res);

        // Check if render is called with the correct parameters
        expect(res.render).toHaveBeenCalledWith('userpurchases', {
            layout: 'userOrders',
            script: '/./js/userPurchases.js',
            orders: expect.any(Array),
            category: 'allOrders',
            nextPage: true,
            prevPage: false
        });
    });

    it('should handle errors and send status 400', async () => {
        // Mock the behavior of Order.find to throw an error
        jest.spyOn(Order, 'find').mockRejectedValueOnce(new Error('Mock Error'));

        // Call the function
        await userController.getUserPurchases(req, res);

        // Check if sendStatus is called with 400
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  //searchUserPurchases
  describe('searchUserPurchases', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { 
            session: { 
                userID: 'mockUserID', 
                pageIndex: 0 // Initial page index
            }, 
            query: {}, // No query initially
            params: {} // No params initially
        };
        res = { 
            render: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should search for orders and render user purchases', async () => {
        req.query.product_query = 'mockProductID'; // Set search query

        const mockOrders = [
            {
                _id: 'mockOrderID',
                firstName: 'Jay',
                lastName: 'Park',
                email: 'jay.park@example.com',
                date: new Date(),
                status: 'succeeded',
                amount: 100,
                items: [{}, {}], // Mock items
                paymongoID: 'mockPaymongoID',
                isCancelled: false
            },
            {
                _id: 'mockOrderID2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                date: new Date(),
                status: 'delivered',
                amount: 150,
                items: [{}], // Mock items
                paymongoID: 'mockPaymongoID2',
                isCancelled: false
            }
        ];

        // Mock the behavior of Order.find
        jest.spyOn(Order, 'find').mockResolvedValueOnce(mockOrders);

        // Call the function
        await userController.searchUserPurchases(req, res);

        // Check if render is called with the correct parameters
        expect(res.render).toHaveBeenCalledWith('userpurchases', {
            layout: 'userOrders',
            orders: expect.any(Array),
            buffer: 'mockProductID',
            script: '/./js/userPurchases.js',
            nextPage: expect.any(Boolean),
            prevPage: expect.any(Boolean)
        });
    });

    it('should handle errors and not render user purchases', async () => {
        req.query.product_query = 'mockProductID'; // Set search query

        // Mock the behavior of Order.find to throw an error
        jest.spyOn(Order, 'find').mockRejectedValueOnce(new Error('Mock Error'));

        // Call the function
        await userController.searchUserPurchases(req, res);

        // Check if render is called with the correct parameters
        expect(res.render).toHaveBeenCalledWith('userpurchases', {
            layout: 'userOrders',
            orders: [],
            buffer: 'mockProductID',
            script: '/./js/userPurchases.js',
            nextPage: false,
            prevPage: false
        });
    });
});

  //editProfile
//   describe('editProfile', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     it('should update user profile and redirect to user profile page', async () => {
//         const req = {
//             body: {
//                 fname: 'UpdatedFirstName',
//                 lname: 'UpdatedLastName',
//                 state: 'UpdatedState',
//                 city: 'UpdatedCity',
//                 postalCode: '12345',
//                 line1: 'UpdatedLine1',
//                 line2: 'UpdatedLine2'
//             },
//             params: {
//                 id: 'mockUserID'
//             }
//         };
//         const expectedUpdate = {
//             firstName: req.body.fname,
//             lastName: req.body.lname,
//             state: req.body.state,
//             city: req.body.city,
//             postalCode: req.body.postalCode,
//             line1: req.body.line1,
//             line2: req.body.line2
//         };

//         // Mock the behavior of User.findByIdAndUpdate
//         jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce(expectedUpdate);

//         await userController.editProfile(req, res);

//         // Check if User.findByIdAndUpdate is called with the correct parameters
//         expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
//             req.params.id,
//             expectedUpdate
//         );

//         // Check if redirect is called with the correct route
//         expect(res.redirect).toHaveBeenCalledWith('/userprofile');

//         // Check if sendStatus is not called
//         expect(res.sendStatus).not.toHaveBeenCalled();
//     });

//     it('should send status 400 if an error occurs', async () => {
//         const req = {
//             body: {
//                 fname: 'UpdatedFirstName',
//                 lname: 'UpdatedLastName',
//                 state: 'UpdatedState',
//                 city: 'UpdatedCity',
//                 postalCode: '12345',
//                 line1: 'UpdatedLine1',
//                 line2: 'UpdatedLine2'
//             },
//             params: {
//                 id: 'mockUserID'
//             }
//         };

//         // Mock the behavior of User.findByIdAndUpdate to throw an error
//         jest.spyOn(User, 'findByIdAndUpdate').mockRejectedValueOnce(new Error('Mock Error'));

//         await userController.editProfile(req, res);

//         // Check if User.findByIdAndUpdate is called with the correct parameters
//         expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
//             req.params.id,
//             expect.any(Object)
//         );

//         // Check if sendStatus is called with 400
//         expect(res.sendStatus).toHaveBeenCalledWith(400);

//         // Check if redirect is not called
//         expect(res.redirect).not.toHaveBeenCalled();
//     });
// });

  //logout
  describe('logout', () => {
    let req;
    let res;

    beforeEach(() => {
      req = { session: { destroy: jest.fn() } };
      res = { redirect: jest.fn() };
      jest.clearAllMocks();
    });

    it('should log out the user and redirect to the home page', async () => {
      await userController.logout(req, res);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  //getUserOrderDetails
  describe('getUserOrderDetails', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { params: { orderID: 'mockOrderID' } };
        res = {
            render: jest.fn(),
            sendStatus: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should render order details if order is found', async () => {
        const mockOrder = {
            _id: 'mockOrderID',
            date: new Date(),
            firstName: 'Jay',
            lastName: 'Park',
            email: 'jay.park@example.com',
            status: 'Pending',
            city: 'Pasay',
            postalCode: '1234',
            state: 'NCR',
            line1: 'test street',
            line2: 'test village',
            isCancelled: false,
            items: [
                { name: 'Product 1', price: 10, quantity: 2 },
                { name: 'Product 2', price: 15, quantity: 1 }
            ],
            amount: 35,
            paymongoID: 'mockPaymongoID'
        };
        jest.spyOn(Order, 'findById').mockResolvedValueOnce(mockOrder);

        await userController.getUserOrderDetails(req, res);

        expect(Order.findById).toHaveBeenCalledWith('mockOrderID');
        expect(res.render).toHaveBeenCalledWith('userorderdetails', {
            layout: 'userOrders',
            orderID: 'mockOrderID',
            orderDate: expect.any(Date),
            fname: 'Jay',
            lname: 'Park',
            email: 'jay.park@example.com',
            status: 'Pending',
            city: 'Pasay',
            postalCode: '1234',
            state: 'NCR',
            line1: 'test street',
            line2: 'test village',
            isCancelled: false,
            items: [
                { name: 'Product 1', price: 10, quantity: 2 },
                { name: 'Product 2', price: 15, quantity: 1 }
            ],
            amount: 35,
            paymongoID: 'mockPaymongoID',
            script: '../js/userOrder.js'
        });
        expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should send status 400 if order is not found', async () => {
        jest.spyOn(Order, 'findById').mockResolvedValueOnce(null);

        await userController.getUserOrderDetails(req, res);

        expect(Order.findById).toHaveBeenCalledWith('mockOrderID');
        expect(res.render).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });

  //changePageUserPurchases
  describe('changePageUserPurchases', () => {
    let req;
    let res;

    beforeEach(() => {
        req = { 
            session: { 
                userID: 'mockUserID', 
                pageIndex: 0 // Initial page index
            }, 
            params: { 
                category: 'allOrders' // Initial category
            },
            body: {} // No change initially
        };
        res = { sendStatus: jest.fn() };
        jest.clearAllMocks();
    });

    it('should increment page index and send status 200 for next page', async () => {
        req.body.change = 'next'; // Set change to next page

        const mockOrders = [{}, {}]; // Mock orders

        // Mock the behavior of Order.find
        jest.spyOn(Order, 'find').mockResolvedValueOnce(mockOrders);

        // Call the function
        await userController.changePageUserPurchases(req, res);

        // Check if session page index is incremented
        expect(req.session.pageIndex).toEqual(1);

        // Check if sendStatus is called with 200
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should decrement page index and send status 200 for previous page', async () => {
        req.body.change = 'prev'; // Set change to previous page
        req.session.pageIndex = 1; // Set page index to simulate being on page 1

        const mockOrders = [{}, {}]; // Mock orders

        // Mock the behavior of Order.find
        jest.spyOn(Order, 'find').mockResolvedValueOnce(mockOrders);

        // Call the function
        await userController.changePageUserPurchases(req, res);

        // Check if session page index is decremented
        expect(req.session.pageIndex).toEqual(0);

        // Check if sendStatus is called with 200
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should reset page index and send status 200 if out of bounds', async () => {
        req.session.pageIndex = 2; // Set page index out of bounds
        req.body.change = 'next'; // Set change to next page

        const mockOrders = [{}, {}]; // Mock orders

        // Mock the behavior of Order.find
        jest.spyOn(Order, 'find').mockResolvedValueOnce(mockOrders);

        // Call the function
        await userController.changePageUserPurchases(req, res);

        // Check if session page index is reset to 0
        expect(req.session.pageIndex).toEqual(0);

        // Check if sendStatus is called with 200
        expect(res.sendStatus).toHaveBeenCalledWith(200);
    });

    it('should send status 400 if an error occurs', async () => {
        // Mock the behavior of Order.find to throw an error
        jest.spyOn(Order, 'find').mockRejectedValueOnce(new Error('Mock Error'));

        // Call the function
        await userController.changePageUserPurchases(req, res);

        // Check if sendStatus is called with 400
        expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });


  //checkVerified
  describe('checkVerified', () => {
    let req;
    let res;

    beforeEach(() => {
      req = { session: { userID: 'mockUserID' } };
      res = { send: jest.fn(), sendStatus: jest.fn() };
      jest.clearAllMocks();
    });

    it('should send user verification status and ID if user is logged in', async () => {
      const mockUser = { _id: 'mockUserID', isVerified: true };

      jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser);

      await userController.checkVerified(req, res);

      expect(User.findById).toHaveBeenCalledWith('mockUserID', { isVerified: 1 });
      expect(res.send).toHaveBeenCalledWith({ isVerified: true, id: 'mockUserID' });
      expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should send status 400 if there is an error', async () => {
      jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error());

      await userController.checkVerified(req, res);

      expect(User.findById).toHaveBeenCalledWith('mockUserID', { isVerified: 1 });
      expect(res.sendStatus).toHaveBeenCalledWith(400);
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});






  
  