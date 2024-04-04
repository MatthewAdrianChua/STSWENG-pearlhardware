import registerController from '../controllers/registerController.js';

import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { User } from '../model/userSchema.js';

import {jest} from '@jest/globals'
import { beforeEach, describe } from 'node:test';

jest.useFakeTimers()

// Mock models
jest.mock('../model/userSchema.js'); // Mocking the User model
jest.mock('express-validator');
jest.mock('bcrypt');

describe('Register controller', () => {


    // TODO: getRegister function
    describe('getRegister function', () => {
        // let req, res;

        // beforeEach(() => {
        //     req = {};
        //     res = {
        //         render: jest.fn(), // Mock the render function
        //         sendStatus: jest.fn() // Mock the sendStatus function
        //     };
        // });
        
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


    // TODO: register function
    describe('register function', () => {
        let req, res;

        beforeEach(() => {
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

            // validationResult.mockReturnValue({
            //     isEmpty: jest.fn(() => false),
            //     array: jest.fn(() => [
            //         { msg: 'Email already exists!', path: 'email' },
            //         { msg: 'Postal code should be 4 digits', path: 'postalCode' },
            //         { msg: 'Invalid email value', path: 'email' }
            //     ])
            // });

            // User.mockReset();

        });

        const mockValidationResult = jest.fn().mockReturnValue({
            isEmpty: jest.fn(() => true),
            array: jest.fn(() => [
                { msg: 'some error message', path: 'some path' },
            ]),
        });
        
        jest.mock('express-validator', () => ({
            validationResult: jest.fn(() => mockValidationResult),
        }));

        afterEach(() => {
            jest.clearAllMocks();
        });

        // TODO: status 405 error for "email already exists"
        it('should return status 405 for "email already exists"', async () => {
            jest.spyOn(User.prototype, 'save').mockImplementation(() =>
                Promise.resolve({ email: 'testingperson@email.com' })
            );

            await registerController.register(req, res);

           // expect(validationResult).toHaveBeenCalledWith(req);

            const errors = jest.fn().mockReturnValue({
                isEmpty: jest.fn(() => false),
                array: jest.fn(() => [
                    { msg: 'Email already exists!', path: 'email' },
                ]),
            });
        
            expect(res.sendStatus).toHaveBeenCalledWith(405);            
        });

        // TODO: status 410 error for "postal code should be 4 digits"
        it('should return status 410 for "postal code should be 4 digits"', async () => {
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

            await registerController.register(req, res);
            
            const errors = jest.fn().mockReturnValue({
                isEmpty: jest.fn(() => false),
                array: jest.fn(() => [
                    { msg: 'Postal code should be 4 digits', path: 'postalCode' },
                ]),
            });

            expect(res.sendStatus).toHaveBeenCalledWith(410);
        });

        // TODO: status 406 error for "invalid email value"
        it('should return status 406 for "invalid email value"', async () => {
            let req, res;

            req = {
                body: {
                    firstName: "Test",
                    lastName: "Person",
                    email: "testingperson",
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

            await registerController.register(req, res);

            const errors = jest.fn().mockReturnValue({
                isEmpty: jest.fn(() => false),
                array: jest.fn(() => [
                    { msg: 'Invalid email format!', path: 'email' },
                ]),
            });

            expect(res.sendStatus).toHaveBeenCalledWith(406);
        });

        // TODO: status 500 error for "username already exists"
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

            // Mock existing user with valid credentials
            const newUser = {
                firstName: "Test",
                lastName: "Person",
                email: "testingperson@email.com",
                password: await bcrypt.hash('testpassword', 10),
                line1: "Pixel World",
                line2: "Asterum",
                city: "Binan",
                state: "Laguna",
                postalCode: 4026,
                country: "PH"
            };

            const errors = null;

            await registerController.register(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(500);
        });

        // status 200 for valid registration credentials
        it('should return status 200 for "valid registration credentials"', async () => {
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

            const errors = null;

            await registerController.register(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });

    });



});
