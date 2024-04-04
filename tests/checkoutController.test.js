import checkoutController from '../controllers/checkoutController.js';

import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import { Order } from '../model/orderSchema.js';

import {jest} from '@jest/globals'
import { beforeEach, describe, it } from 'node:test';
import {Types} from 'mongoose';
import fetch from 'node-fetch';

jest.useFakeTimers()

// Mock models
jest.mock('../model/userSchema.js');
jest.mock('../model/productSchema.js');
jest.mock('../model/orderSchema.js');
// jest.mock('node-fetch');
global.fetch = jest.fn();

describe('Checkout controller', () => {

    // checkout page rendering
    describe('checkout function', () => {

        //no errors when rendering the checkout page
        test('should render the checkout page with script', async () => {
            let req, res;
            
            req = {};
            res = {
                render: jest.fn(), // Mock the render function
                sendStatus: jest.fn() // Mock the sendStatus function
            };

            await checkoutController.checkout(req, res);

            expect(res.render).toHaveBeenCalledWith('checkout', {
                script: './js/checkout.js'
            });

            expect(res.sendStatus).not.toHaveBeenCalled();

            jest.clearAllMocks();
        });

        //errors when rendering the checkout page, status 400
        test('should send status 400 if an error occurs', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(), // Mock the render function
                sendStatus: jest.fn() // Mock the sendStatus function
            };

            res.render.mockImplementation(() => { throw new Error(); });
            await checkoutController.checkout(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(400);

            jest.clearAllMocks();
        });
    });

    // TODO: postCheckout function
    describe('postCheckout function', () => {

        // successfully paid, return status 200
        test('successful checkout', async () => {
            let req, res;

            req = {
                body: {
                    items: ['Brush', 'Gloves'],
                    amount: [20, 10]
                },
                session: {
                    userID: 'userID'
                }
            };
            res = {
                render: jest.fn(() => res),
                sendStatus: jest.fn(() => res)
            };

            const user = {
                _id: 'userID',
                firstName: 'Peter',
                lastName: 'Parker',
                email: 'spiderman@marvel.com'
            };
            const prod1 = {
                _id: 'prod1',
                name: 'Brush',
                price: 20,
                productpic: 'prod1.jpg'
            };
            const prod2 = {
                _id: 'prod2',
                name: 'Gloves',
                price: 10,
                productpic: 'prod2.jpg'
            };
            const order = { _id: 'orderID' };

            jest.spyOn(User, 'findById').mockReturnValue({ exec: jest.fn().mockResolvedValue(user) });

            const testUser = await User.findById(user._id).exec();

            const findByIdProductMock = jest.spyOn(Product, 'findById');
            findByIdProductMock.mockResolvedValueOnce(prod1).mockResolvedValueOnce(prod2);

            const saveMock = jest.spyOn(Order.prototype, 'save');
            saveMock.mockResolvedValue(order);

            const findByIdAndUpdateMock = jest.spyOn(Order, 'findByIdAndUpdate');
            findByIdAndUpdateMock.mockResolvedValue(order);

            await checkoutController.postCheckout(req,res);

            expect(testUser).toEqual(user);
            expect(User.findById).toHaveBeenCalledWith(user._id);
            // expect(res.status).toHaveBeenCalledWith(200);

            jest.clearAllMocks();
        });

        // entered an invalid amount, return status 401
        test('entered an invalid amount, return status 401', async () => {
            let req, res;

            req = {
                body: {
                    _id: ['prod1', 'prod2'],
                    items: ['Brush', 'Gloves'],
                    amount: [1, 1]
                },
                session: {
                    userID: 'userID'
                } 
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };

            const prod1 = {
                _id: 'prod1',
                name: 'Brush',
                price: 1,
                productpic: 'prod1.jpg'
            };
            const prod2 = {
                _id: 'prod2',
                name: 'Gloves',
                price: 1,
                productpic: 'prod2.jpg'
            };

            const findByIdProductMock = jest.spyOn(Product, 'findById');
            findByIdProductMock.mockResolvedValueOnce(prod1).mockResolvedValueOnce(prod2);

            await checkoutController.postCheckout(req,res);

            expect(res.sendStatus).toHaveBeenCalledWith(401);

            jest.clearAllMocks();
        });

        // failed to place order, return status 500
        test('failed to place order, return status 500', async () => {
            let req, res;

            req = {
                body: {
                    items: ['Brush', 'Gloves'],
                    amount: [20, 10]
                },
                session: {
                    userID: 'userID'
                }
            };
            res = {
                render: jest.fn(() => res),
                sendStatus: jest.fn(() => res)
            };

            const prod1 = {
                _id: 'prod1',
                name: 'Brush',
                price: 1,
                productpic: 'prod1.jpg'
            };
            const prod2 = {
                _id: 'prod2',
                name: 'Gloves',
                price: 1,
                productpic: 'prod2.jpg'
            };

            const findByIdProductMock = jest.spyOn(Product, 'findById');
            findByIdProductMock.mockResolvedValueOnce(prod1).mockResolvedValueOnce(prod2);

            const mockError = new Error('Placing order failed!');
            jest.spyOn(console, 'error').mockImplementation(() => {});
            jest.spyOn(Order.prototype, 'save').mockRejectedValueOnce(mockError);

            await checkoutController.postCheckout(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(500);

            jest.clearAllMocks();
        });
    });

    // TODO: checkoutSuccess function
    describe('checkoutSuccess function', () => {

        // failed checkout, status 400
        test('failed checkout, return status 400', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };

            res.render.mockImplementation(() => { throw new Error(); });
            await checkoutController.checkout(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(400);

            jest.clearAllMocks();
        });

    });


});