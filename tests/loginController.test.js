import loginController from '../controllers/loginController.js';
import { User } from '../model/userSchema.js';
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