import checkoutController from '../controllers/checkoutController.js';

import { User } from '../model/userSchema.js';
import { Product } from '../model/productSchema.js';
import { Order } from '../model/orderSchema.js';

import {jest} from '@jest/globals'
import { beforeEach, describe, it } from 'node:test';

jest.useFakeTimers()

// Mock models
jest.mock('../model/userSchema.js');
jest.mock('../model/productSchema.js');
jest.mock('../model/orderSchema.js');

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
        test('successful checkout, return status 200', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };

            

            jest.clearAllMocks();
        });

        // entered an invalid amount, return status 401
        test('entered an invalid amount, return status 401', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };



            jest.clearAllMocks();
        });

        // failed to place order, return status 500
        test('failed to place order, return status 500', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };



            jest.clearAllMocks();
        });
    });

    // TODO: checkoutSuccess function
    describe('checkoutSuccess function', () => {

        // checkout success
        test('finished checkout, checkout success', async () => {
            let req, res;

            req = {
                params: {
                    orderID: 123
                }
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };



            jest.clearAllMocks();
        });

        // failed to fetch order, status 500
        test('failed to fetch order, return status 500', async () => {
            let req, res;

            req = {};
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };



            jest.clearAllMocks();
        });

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