import registerController from '../controllers/registerController.js';

import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User } from '../model/userSchema.js';

import {jest} from '@jest/globals'
import { beforeEach, describe, afterEach } from 'node:test';
// import { register } from 'node:module';

jest.useFakeTimers()

// Mock models
jest.mock('../model/userSchema.js'); // Mocking the User model
jest.mock('express-validator');
jest.mock('bcrypt');

// jest.mock('express-validator', () => ({
//     validationResult: jest.fn()
// }));

describe('Register controller', () => {


    // TODO: getRegister function
    describe('getRegister function', () => {
        
        afterEach(() => {
            jest.clearAllMocks();
        });

        // no errors in rendering register page
        it('it should render the register page', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(), // Mock the render function
                sendStatus: jest.fn() // Mock the sendStatus function
            };
            
            await registerController.getRegister(req, res);

            expect(res.render).toHaveBeenCalledWith('register', {
                script: './js/register.js'
            });

            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        // error in rendering register page
        it('should send status 400 if an error occurs', async () => {
            let req, res;
            
            req = {};
            res = {
                render: jest.fn(), // Mock the render function
                sendStatus: jest.fn() // Mock the sendStatus function
            };
            
            res.render.mockImplementation(() => { throw new Error(); });
            
            await registerController.getRegister(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });


    // register function
    describe('register function', () => {

        // status 500 error for "username already exists"
        it('should return status 500 for "username already exists"', async () => {
            let req, res;

            req = {
                body: {
                    firstName: "Test",
                    lastName: "Person",
                    email: "testingperson@email.com",
                    password: "testpassword",
                    line1: "Pixel World",
                    line2: "Asterum",
                    city: "Binan",
                    state: "Laguna",
                    postalCode: 4026,
                    country: "PH"
                }
            };
            res = {
                sendStatus: jest.fn()
            }

            const User = {
                save: jest.fn().mockRejectedValue(new Error('Username already exists!'))
            };

            await registerController.register(req,res);

            expect(res.sendStatus).toHaveBeenCalledWith(500);

            jest.clearAllMocks();
        });

    });

    // resendVerification function
    describe('resendVerification function', () => {

        // resent verification email, status 200
        it('should resend verification email, return status 200', async () => {
            let req, res;

            req = {
                session: { userID: 'user_id' }
            };
            res = {
                sendStatus: jest.fn()
            };

            const user = {
                _id: 'user_id',
                email: 'user@email.com'
            };

            jest.spyOn(User, 'findById').mockResolvedValue(user);

            await registerController.resendVerification(req, res);

            // expect(registerController.resendVerification.sendVerificationEmail)
            expect(res.sendStatus).toHaveBeenCalledWith(200);

            jest.clearAllMocks();
        });

        // error resending email, status 500
        it('should catch error in resending email, return status 500', async () => {
            let req, res;

            req = {
                session: { userID: 'user_id' }
            };
            res = {
                sendStatus: jest.fn()
            };

            jest.spyOn(User, 'findById').mockImplementation(() => { throw new Error() });

            await registerController.resendVerification(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(500);

            jest.clearAllMocks();
        });

    });

});
