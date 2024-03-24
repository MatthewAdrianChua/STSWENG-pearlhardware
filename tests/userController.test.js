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
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
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
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
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
    // describe('getUser', () => {
    //     beforeEach(() => {
    //         //Clear mock calls between tests
    //         jest.clearAllMocks();
    //     });

    //     it('should send user ID if user is logged in', async () => {
    //         const expectedUserID = 'mockUserID';
    //         const reqWithUserID = { session: { userID: expectedUserID } };

    //         await userController.getUser(req, res);

    //         // Check if response status is set to 200 and user ID is sent
    //         expect(res.status).toHaveBeenCalledWith(200);
    //         expect(res.send).toHaveBeenCalledWith(expectedUserID.toString());
    //     });

    //     it('should send status 400 if user is not logged in', async () => {
    //         const reqWithoutUserID = { session: {} };

    //         await userController.getUser(reqWithoutUserID, res);

    //         // Check if response status 400 is sent
    //         expect(res.sendStatus).toHaveBeenCalledWith(400);
    //     });
    // });
  
  //getUserPurchases


  //searchUserPurchases


  //editProfile
  

  //logout


  //getUserOrderDetails


  //changePageUserPurchases


  //checkVerified

});

  
  