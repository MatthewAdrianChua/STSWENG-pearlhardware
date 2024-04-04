import refundController from "../controllers/refundController.js";
import {Product} from "../model/productSchema.js";
import { User } from '../model/userSchema.js';
import { Order } from "../model/orderSchema.js";
import {jest} from '@jest/globals'
import { describe } from 'node:test';
import {Refund} from '../model/refundSchema.js'
import { refundImage } from "../model/refundImages.js";
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

jest.mock('../model/productSchema.js');
jest.mock('../model/orderSchema.js');
jest.mock('../model/userSchema.js');
jest.mock('../model/refundSchema.js');
jest.mock('../model/refundImages.js');
jest.mock('node-fetch');

describe('Refund Controller', () => {
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
    }),

    describe('getAdminRefundDetails', () => {
        let req, res;
    
        beforeEach(() => {
            req = {
                params: {
                    refundID: 'refundID'
                },
                session: {
                    userID: 'adminUserID'
                }
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should render admin refund details if user is authorized', async () => {
            const refund = {
                _id: 'refundID',
                userID: 'userID',
                orderID: 'orderID',
                itemName: 'Test Item',
                itemID: 'itemID',
                price: 10,
                amount: 2,
                totalAmount: 20,
                status: 'For review',
                reason: 'Test reason',
                comments: 'Test comments',
                evidence: ['imageID1', 'imageID2'],
                createdDate: new Date(),
                denialReason: '',
            };
            const user = {
                email: 'test@example.com',
                isAuthorized: true
            };
            const order = {
                date: new Date(),
                paymentID: 'paymentID'
            };
    
            jest.spyOn(Refund, 'findById').mockResolvedValue(refund);
            jest.spyOn(Order, 'findById').mockResolvedValue(order);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
    
            await refundController.getAdminRefundDetails(req, res);
    
            expect(Refund.findById).toHaveBeenCalledWith('refundID');
            expect(User.findById).toHaveBeenCalledWith('userID');
            expect(Order.findById).toHaveBeenCalledWith('orderID');
            expect(res.render).toHaveBeenCalledWith('admin_refund_details', {
                layout: 'adminRefund',
                script: '../js/adminRefundDetails.js',
                refundID: 'refundID',
                email: 'test@example.com',
                dateOfOrder: order.date,
                dateOfRefund: refund.createdDate,
                itemName: 'Test Item',
                itemID: 'itemID',
                price: 10,
                amount: 2,
                totalAmount: 20,
                status: 'For review',
                reason: 'Test reason',
                comments: 'Test comments',
                evidence: ['http://localhost:3000/refundImage/imageID1', 'http://localhost:3000/refundImage/imageID2'],
                paymentID: 'paymentID',
                denialReason: ''
            });
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
    
        it('should send status 400 if user is unauthorized', async () => {
            const refund = {
                userID: 'userID'
            };
            const user = {
                isAuthorized: false
            };

            jest.spyOn(Refund, 'findById').mockResolvedValue(refund);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
    
            await refundController.getAdminRefundDetails(req, res);
    
            expect(res.sendStatus).toHaveBeenCalledWith(400);
            expect(res.render).not.toHaveBeenCalled();
        });
    
        it('should handle errors by sending status 400', async () => {
            const error = new Error('Test error');
            jest.spyOn(Refund, 'findById').mockResolvedValue(error);
    
            await refundController.getAdminRefundDetails(req, res);
    
            expect(res.sendStatus).toHaveBeenCalledWith(400);
            expect(res.render).not.toHaveBeenCalled();
        });
    }),

    describe('denyRefund', () => {
        beforeEach(() => {
          jest.resetAllMocks(); // Reset all mocks before each test
        });
      
        it('should deny refund and update status with provided reason', async () => {
          const req = {
            body: {
              reasonString: 'Reason for denial',
              refundID: 'refundID123'
            }
          };
      
          const res = {
            sendStatus: jest.fn()
          };

          const refund = {
            status: 'Refund denied',
            denialReason: 'Reason for denial'
          };

          jest.spyOn(Refund, 'findByIdAndUpdate').mockResolvedValue(refund);
      
          // Call the function
          await refundController.denyRefund(req, res);
      
          // Check if Refund.findByIdAndUpdate was called with the correct parameters
          expect(Refund.findByIdAndUpdate).toHaveBeenCalledWith(
            'refundID123',
            expect.objectContaining({
              status: 'Refund denied',
              denialReason: 'Reason for denial'
            })
          );
      
          // Check if res.sendStatus(200) was called
          expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
      
        it('should handle errors by sending status 400', async () => {
          const req = {
            body: {
              
            }
          };
      
          const res = {
            sendStatus: jest.fn()
          };

          const error = new Error('Test error');
      
          jest.spyOn(Refund, 'findByIdAndUpdate').mockRejectedValue(error);
      
          // Call the function
          await refundController.denyRefund(req, res);
      
          // Check if res.sendStatus(400) was called
          expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
      }),

      describe('getAdminRefundManagement', () => {
        let req, res;
      
        beforeEach(() => {
          req = { 
            params: { category: 'refundApproved'},
            session: { userID: 'someUserID' } 
          };
          res = { 
            render: jest.fn(),
            sendStatus: jest.fn() 
          };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
      
        it('should render admin_refund_management_page for refundApproved category', async () => {

            const refund = [{
                userID: '1',
                _id: '1',
                createdDate: new Date('2024-03-06T20:27:36.359+00:00'),
                status: 'Refund approved',
                price: 1,
                amount: 1
            }];
        
            const user = {
                isAuthorized: true,
                email: 'test@email.com',
            }

        
            jest.spyOn(Refund, 'find').mockResolvedValue(refund);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
        
            await refundController.getAdminRefundManagement(req, res);
        
            expect(Refund.find).toHaveBeenCalledWith({
              status: "Refund approved"
            });

            //expect(User.findById).toHaveBeenCalledWith({userID: 'someUserID'});
            
            // Assert render function called with expected arguments
            expect(res.render).toHaveBeenCalledWith('admin_refund_management_page', {
              layout: 'adminRefund',
              script: '../js/adminRefundManagement.js',
              refundList: [{
                       amountToBeRefunded: 1,
                      date: "2024-03-06",
                       email: "test@email.com",
                       refundID: "1",
                       status: "Refund approved",
                     }],
              category: 'refundApproved'
            });
        
            // Assert sendStatus function not called
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
        
      
        // Example test case for unauthorized user
        it('should send status 400 for unauthorized user', async () => {
            const refund = [{
                userID: '1',
                _id: '1',
                createdDate: new Date('2024-03-06T20:27:36.359+00:00'),
                status: 'Refund approved',
                price: 1,
                amount: 1
            }];
        
            const user = {
                isAuthorized: false,
                email: 'test@email.com',
            }

        
            jest.spyOn(Refund, 'find').mockResolvedValue(refund);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
      
          await refundController.getAdminRefundManagement(req, res);
      
          // Assert sendStatus called with status 400
          expect(res.sendStatus).toHaveBeenCalledWith(400);
      
          // Assert render function not called
          expect(res.render).not.toHaveBeenCalled();
        });
      
      }),

      describe('getUserRefundManagement', () => {
        let req, res;
      
        beforeEach(() => {
          req = { 
            params: { category: 'refundApproved'},
            session: { userID: 'someUserID' } 
          };
          res = { 
            render: jest.fn(),
            sendStatus: jest.fn() 
          };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
      
        it('should render user_refund_management_page for refundApproved category', async () => {

            const refund = [{
                userID: '1',
                _id: '1',
                createdDate: new Date('2024-03-06T20:27:36.359+00:00'),
                status: 'Refund approved',
                price: 1,
                amount: 1
            }];
        
            const user = {
                isAuthorized: true,
                email: 'test@email.com',
                isVerified: true
            }

        
            jest.spyOn(Refund, 'find').mockResolvedValue(refund);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
            jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
        
            await refundController.getUserRefundManagement(req, res);
        
            expect(Refund.find).toHaveBeenCalledWith({
              status: "Refund approved", userID: "someUserID"
            });

            //expect(User.findById).toHaveBeenCalledWith({userID: 'someUserID'});
            
            // Assert render function called with expected arguments
            expect(res.render).toHaveBeenCalledWith('user_refund_management_page', {
              layout: 'userRefund',
              script: '../js/userRefundManagement.js',
              refundList: [{
                       amountToBeRefunded: 1,
                      date: "2024-03-06",
                       email: "test@email.com",
                       refundID: "1",
                       status: "Refund approved",
                     }],
              category: 'refundApproved'
            });
        
            // Assert sendStatus function not called
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
        
      
        // Example test case for unauthorized user
        it('should send status 400 for unverified user', async () => {
          // Simulate unauthorized user
          const refund = [{
            userID: '1',
            _id: '1',
            createdDate: new Date('2024-03-06T20:27:36.359+00:00'),
            status: 'Refund approved',
            price: 1,
            amount: 1
        }];
    
        const user = {
            email: 'test@email.com',
            isVerified: false
        }

    
        jest.spyOn(Refund, 'find').mockResolvedValue(refund);
        jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
        jest.spyOn(User, 'findById').mockResolvedValueOnce(user);
      
          await refundController.getUserRefundManagement(req, res);
      
          // Assert render function not called
          expect(res.render).not.toHaveBeenCalled();
        });
      
      }),

      describe('getAdminRefundDetails', () => {
        let req, res;
    
        beforeEach(() => {
            req = {
                params: {
                    refundID: 'refundID'
                },
                session: {
                    userID: 'adminUserID'
                }
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn()
            };
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should render user refund details', async () => {
            const refund = {
                _id: 'refundID',
                userID: 'userID',
                orderID: 'orderID',
                itemName: 'Test Item',
                itemID: 'itemID',
                price: 10,
                amount: 2,
                totalAmount: 20,
                status: 'For review',
                reason: 'Test reason',
                comments: 'Test comments',
                evidence: ['imageID1', 'imageID2'],
                createdDate: new Date(),
                denialReason: '',
            };
            const user = {
                email: 'test@example.com',
                isAuthorized: true
            };
            const order = {
                date: new Date(),
                paymentID: 'paymentID'
            };
    
            jest.spyOn(Refund, 'findById').mockResolvedValue(refund);
            jest.spyOn(Order, 'findById').mockResolvedValue(order);
            jest.spyOn(User, 'findById').mockResolvedValue(user);
    
            await refundController.getUserRefundDetails(req, res);
    
            expect(Refund.findById).toHaveBeenCalledWith('refundID');
            expect(User.findById).toHaveBeenCalledWith('userID');
            expect(Order.findById).toHaveBeenCalledWith('orderID');
            expect(res.render).toHaveBeenCalledWith('user_refund_details', {
                layout: 'userRefund',
                refundID: 'refundID',
                email: 'test@example.com',
                dateOfOrder: order.date,
                dateOfRefund: refund.createdDate,
                itemName: 'Test Item',
                itemID: 'itemID',
                price: 10,
                amount: 2,
                totalAmount: 20,
                status: 'For review',
                reason: 'Test reason',
                comments: 'Test comments',
                evidence: ['http://localhost:3000/refundImage/imageID1', 'http://localhost:3000/refundImage/imageID2'],
                paymentID: 'paymentID',
                denialReason: ''
            });
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
    
        it('should handle errors by sending status 400', async () => {
            const error = new Error('Test error');
            jest.spyOn(Refund, 'findById').mockResolvedValue(error);
    
            await refundController.getUserRefundDetails(req, res);
    
            expect(res.sendStatus).toHaveBeenCalledWith(400);
            expect(res.render).not.toHaveBeenCalled();
        });
    }),

    describe('refundCustomer', () => {
        let req, res;
    
        beforeEach(() => {
            req = {
                body: {
                    paymentID: 'paymentID',
                    refundID: 'refundID'
                }
            };
            res = {
                sendStatus: jest.fn()
            };
            //process.env.paymongoKey = 'mockedPaymongoKey';
            fetch.resetMocks();
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should refund customer and update refund status if successful', async () => {

            fetch.mockResponseOnce({response: {id: '123'}});
    
            const refund = await refundController.refundCustomer(req, res);
    
            await expect(fetch).toHaveBeenCalledWith('https://api.paymongo.com/refunds', {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    authorization: `Basic ${btoa(process.env.paymongoKey)}`
                },
                body: JSON.stringify({
                    data: {
                        attributes: { amount: 5000, payment_id: 'paymentID', reason: 'others' }
                    }
                })
            });
            
            //expect(Refund.findByIdAndUpdate).toHaveBeenCalledWith(updateRefundMock);

            expect(refund).toEqual(200);
            
        });
    
        it('should handle errors by sending status 400', async () => {

            fetch.mockReject(() => "API failure");
    
            const refund = await refundController.refundCustomer(req, res);
    
            //expect(refund).toEqual(200);
            await expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });

    
});