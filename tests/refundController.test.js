import refundController from "../controllers/refundController.js";
import {Product} from "../model/productSchema.js";
import { User } from '../model/userSchema.js';
import { Order } from "../model/orderSchema.js";
import {jest} from '@jest/globals'
import { describe } from 'node:test';

jest.mock('../model/productSchema.js');
jest.mock('../model/orderSchema.js');
jest.mock('../model/userSchema.js');

describe('getRefund', () => {
    let req, res;

    beforeEach(() => {
        req = {
            session: {
                productID: 'productID',
                refundOrderID: 'refundOrderID',
                userID: 'userID',
                refundItemIndex: 0
            }
        };
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            sendStatus: jest.fn()
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render refund ticket page if user is verified', async () => {
        const product = {
            name: 'Test Product',
            price: 10,
            _id: 'productID'
        };
        const order = {
            date: new Date(),
            items: [{ amount: 2 }]
        };
        const user = {
            email: 'test@example.com',
            isVerified: true
        };

        jest.spyOn(Product, 'findById').mockResolvedValue(product);
        jest.spyOn(Order, 'findById').mockResolvedValue(order);
        jest.spyOn(User, 'findById').mockResolvedValue(user);
        

        await refundController.getRefund(req, res);

        expect(Product.findById).toHaveBeenCalledWith('productID');
        expect(Order.findById).toHaveBeenCalledWith('refundOrderID');
        expect(User.findById).toHaveBeenCalledWith('userID');
        expect(res.render).toHaveBeenCalledWith('refund_ticket_page', {
            layout: 'userOrders',
            script: '../js/refundTicketPage.js',
            email: 'test@example.com',
            orderDate: order.date,
            itemName: 'Test Product',
            itemID: 'productID',
            price: 10,
            amount: 2,
            totalAmount: 20
        });
        expect(res.redirect).not.toHaveBeenCalled();
        expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should redirect to email verification page if user is not verified', async () => {
        const user = {
            isVerified: false
        };
        jest.spyOn(User, 'findById').mockResolvedValue(user);

        await refundController.getRefund(req, res);

        expect(User.findById).toHaveBeenCalledWith('userID');
        expect(res.redirect).toHaveBeenCalledWith('/emailVerify?sk=true');
        expect(res.render).not.toHaveBeenCalled();
        expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should handle errors by sending status 400', async () => {
        const error = new Error('Test error');
        
        jest.spyOn(User, 'findById').mockRejectedValue(error);

        await refundController.getRefund(req, res);

        expect(res.sendStatus).toHaveBeenCalledWith(400);
        expect(res.render).not.toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });
});