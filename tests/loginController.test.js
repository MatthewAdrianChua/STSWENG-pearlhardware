import loginController from '../controllers/loginController.js';
import { User } from '../model/userSchema.js';
import bcrypt from 'bcrypt';
import {jest} from '@jest/globals'
import { describe } from 'node:test';
import mongoose from 'mongoose';

jest.useFakeTimers()

jest.mock('../model/userSchema.js'); // Mocking the User model

describe('Login Controller', () => {

  describe('Login function', () => {
  let req, res;

  beforeEach(() => {
    req = { //this is the user input to be tested
      body: {
        email: 'test12345@email.com',
        password: '12345'
      },
      session: {} // Mock the session object
    };

    res = {
      sendStatus: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return status 200 for valid credentials', async () => {
    // Mock existing user with valid credentials
    const existingUser = { //This is a dummy user that will be used as the comparison in the login function later when its called
      _id: 'someUserId',
      firstName: 'John',
      email: 'test12345@email.com',
      password: await bcrypt.hash('12345', 10),
      isAuthorized: false
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser); //this code sends the existingUser dummy data to the login function and acts as the user data in the database when logging in

    await loginController.login(req, res); //calls the function to be tested with the existingUser dummy data as the user being logged in

    expect(res.sendStatus).toHaveBeenCalledWith(200); //expects to return 200 for success
  });

  it('should return status 201 for valid credentials for admin account', async () => {
    // Mock existing user with valid credentials
    const existingUser = { //This is a dummy user that will be used as the comparison in the login function later when its called
      _id: 'someAdminId',
      firstName: 'John',
      email: 'test12345@email.com',
      password: await bcrypt.hash('12345', 10),
      isAuthorized: true
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser); //this code sends the existingUser dummy data to the login function and acts as the user data in the database when logging in

    await loginController.login(req, res); //calls the function to be tested with the existingUser dummy data as the user being logged in

    expect(res.sendStatus).toHaveBeenCalledWith(201); //expects to return 200 for success
  });

  it('should return status 500 for invalid password', async () => {
    // Mock existing user with valid credentials
    const existingUser = { //This is a dummy user that will be used as the comparison in the login function later when its called
      _id: 'someAdminId',
      firstName: 'John',
      email: 'test12345@email.com',
      password: await bcrypt.hash('123456', 10), //notice here the password should be 123456, while in the testcase its trying to login using password 12345 in the req
      isAuthorized: false
    };
    jest.spyOn(User, 'findOne').mockResolvedValue(existingUser); //this code sends the existingUser dummy data to the login function and acts as the user data in the database when logging in

    await loginController.login(req, res); //calls the function to be tested with the existingUser dummy data as the user being logged in

    expect(res.sendStatus).toHaveBeenCalledWith(500); //expects to return 500
  });

  it('should return status 500 for invalid credentials or email', async () => {
    // Mock User.findOne to return null (user not found)
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await loginController.login(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(500);
  });
  });


  describe('getLogin function', () => {
    let req, res;
  
    beforeEach(() => {
      req = {};
      res = {
        render: jest.fn(), // Mock the render function
        sendStatus: jest.fn() // Mock the sendStatus function
      };
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should render the login page with script', async () => {
      // Call the getLogin function
      await loginController.getLogin(req, res);
  
      // Assert that the render function was called with the expected arguments
      expect(res.render).toHaveBeenCalledWith('login', {
        script: './js/login.js'
      });
  
      // Assert that sendStatus was not called (indicating no error occurred)
      expect(res.sendStatus).not.toHaveBeenCalled();
    });
  
    it('should send status 400 if an error occurs', async () => {
      // Mock an error occurring
      res.render.mockImplementation(() => { throw new Error(); });
  
      // Call the getLogin function
      await loginController.getLogin(req, res);
  
      // Assert that sendStatus was called with status 400
      expect(res.sendStatus).toHaveBeenCalledWith(400);
    });
  });
});

afterAll(() => { 
  mongoose.connection.close()
})