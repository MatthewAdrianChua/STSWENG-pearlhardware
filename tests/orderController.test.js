import { Order } from "../model/orderSchema.js";
import orderController from "../controllers/orderController.js";
import {jest} from '@jest/globals';
import mongoose from "mongoose";
import {Product} from "../model/productSchema.js";
import { User } from '../model/userSchema.js';

jest.mock('../model/orderSchema.js');
jest.mock('../model/userSchema.js');
jest.mock('../model/productSchema.js');

describe('Refund Controller', () => {

    describe('getOrderDetails', () => {
        it('should render adminOrderDetails with order details', async () => {
          const req = { params: { orderID: 'someOrderID' } };
          const res = {
            render: jest.fn(),
            sendStatus: jest.fn()
          };
      
          // Mock Order.findById to return a mock order
          const mockOrder = {
            _id: 'mockOrderID',
            date: new Date(),
            firstName: 'John',
            lastName: 'Doe',
            // Add other properties as needed
          };

          jest.spyOn(Order, 'findById').mockResolvedValue(mockOrder);
      
          await orderController.getOrderDetails(req, res);
      
          expect(Order.findById).toHaveBeenCalledWith('someOrderID');
          expect(res.render).toHaveBeenCalledWith('adminOrderDetails', {
            layout: 'adminMain',
            orderID: 'mockOrderID',
            orderDate: expect.any(Date), // Assuming order.date is a Date object
            fname: 'John',
            lname: 'Doe',
            // Add other expected properties here
            script: '/./js/adminOrderDetails.js'
          });
          expect(res.sendStatus).not.toHaveBeenCalled();
        });
      
        it('should send status 400 if Order.findById throws an error', async () => {
          const req = { params: { orderID: 'someOrderID' } };
          const res = {
            render: jest.fn(),
            sendStatus: jest.fn()
          };
      
          // Mock Order.findById to throw an error
          jest.spyOn(Order, 'findById').mockRejectedValue(new Error('Test error'));
      
          await orderController.getOrderDetails(req, res);
      
          expect(Order.findById).toHaveBeenCalledWith('someOrderID');
          expect(res.sendStatus).toHaveBeenCalledWith(400);
          expect(res.render).not.toHaveBeenCalled();
        });
      }),

      describe('searchOrders', () => {
        it('should search orders and render adminOrders template', async () => {
          const req = { 
            query: { 
              product_query: 'someProductQuery',
              sortBy: 'someSortValue'
            },
            session: {
              nextPage: false,
              prevPage: false,
              pageIndex: 0
            }
          };
          const res = {
            render: jest.fn()
          };
      
          // Mock Order.find to return mock orders
          const mockOrders = [
            {
              _id: 'mockOrderID1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              date: new Date(),
              status: 'Pending',
              amount: 100,
              paymongoID: 'mockPaymongoID1',
              isCancelled: false
            },
            {
              _id: 'mockOrderID2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              date: new Date(),
              status: 'Completed',
              amount: 150,
              paymongoID: 'mockPaymongoID2',
              isCancelled: true
            }
          ];

          jest.spyOn(Order, 'find').mockResolvedValue(mockOrders);
      
          // Mock mongoose.Types.ObjectId
          //mongoose.Types.ObjectId = jest.fn().mockReturnValue('mockID')
      
          await orderController.searchOrders(req, res);
      
          expect(Order.find).toHaveBeenCalledWith({ _id: 'someProductQuery' }, { __v: 0 });
          expect(res.render).toHaveBeenCalledWith('adminOrders', {
            layout: 'adminMain',
            order_list: expect.arrayContaining([
              {
                orderID: 'mockOrderID1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                date: expect.any(String),
                status: 'Pending',
                amount: 100,
                paymongoID: 'mockPaymongoID1',
                isCancelled: 'false'
              },
              {
                orderID: 'mockOrderID2',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                date: expect.any(String),
                status: 'Completed',
                amount: 150,
                paymongoID: 'mockPaymongoID2',
                isCancelled: 'true'
              }
            ]),
            buffer: 'someProductQuery',
            nextPage: false,
            prevPage: false,
            script: '/./js/adminOrders.js'
          });
        });
      
        it('should handle errors and not output a record', async () => {
          const req = { 
            query: { 
              product_query: 'someProductQuery',
              sortBy: 'someSortValue'
            },
            session: {
              nextPage: false,
              prevPage: false,
              pageIndex: 0
            }
          };
          const res = {
            render: jest.fn()
          };
      
          // Mock Order.find to throw an error
          Order.find = jest.fn().mockRejectedValue(new Error('Mock error'));
      
          await orderController.searchOrders(req, res);
      
          expect(res.render).toHaveBeenCalledWith('adminOrders', {
            layout: 'adminMain',
            order_list: [],
            buffer: 'someProductQuery',
            nextPage: false,
            prevPage: false,
            script: '/./js/adminOrders.js'
          });
        });
      }),

      describe('cancelChange', () => {
        let req, res;
      
        beforeEach(() => {
          req = {
            body: {
              id: 'mockOrderID'
            }
          };
          res = {
            sendStatus: jest.fn()
          };
        });
      
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mocks after each test
        });
      
        it('should cancel order and update product stock', async () => {
          // Mock the behavior of Order.findByIdAndUpdate
          const mockOrderUpdate = { items: [{ ID: 'mockProductID', amount: 2 }] };
          Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrderUpdate);
      
          // Mock the behavior of Product.findByIdAndUpdate
          const mockProductUpdate = { quantity: 5 };
          Product.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProductUpdate);
      
          // Call the function under test
          await orderController.cancelChange(req, res);
      
          // Expectations
          expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('mockOrderID', { isCancelled: true });
          expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
            'mockProductID',
            { $inc: { quantity: +2 } },
            { new: true }
          );
          expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
      
        it('should handle errors and send status 400', async () => {
          // Mock the behavior of Order.findByIdAndUpdate to throw an error
          Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
      
          // Call the function under test
          await orderController.cancelChange(req, res);
      
          // Expectations
          expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
      }),

      describe('statusChange', () => {
        let req, res;
      
        beforeEach(() => {
          req = {
            body: {
              orderID: 'mockOrderID',
              status: 'mockStatus'
            }
          };
          res = {
            sendStatus: jest.fn()
          };
        });
      
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mocks after each test
        });
      
        it('should update order status and send status 200', async () => {
          // Mock the behavior of Order.findByIdAndUpdate
          const mockUpdate = { status: 'mockStatus' };
          Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdate);
      
          // Call the function under test
          await orderController.statusChange(req, res);
      
          // Expectations
          expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('mockOrderID', { status: 'mockStatus' });
          expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
      
        it('should handle errors and send status 400', async () => {
          // Mock the behavior of Order.findByIdAndUpdate to throw an error
          Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
      
          // Call the function under test
          await orderController.statusChange(req, res);
      
          // Expectations
          expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
      }),

      describe('changePageAdminCategory', () => {
        let req, res;
      
        beforeEach(() => {
          req = {
            params: {
              category: 'mockCategory'
            },
            body: {
              change: "next"
            },
            session: {
              pageIndex: 0
            }
          };
          res = {
            sendStatus: jest.fn()
          };
        });
      
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mocks after each test
        });
      
        it('should change page index and send status 200', async () => {
          // Mock the behavior of Order.find
          Order.find = jest.fn().mockResolvedValue([{ /* mock orders */ }]);
          
          // Call the function under test
          await orderController.changePageAdminCategory(req, res);
      
          expect(res.sendStatus).toHaveBeenCalledWith(200);
        });
      
        it('should handle errors and send status 400', async () => {
          // Mock the behavior of Order.find to throw an error
          Order.find = jest.fn().mockRejectedValue(new Error('Query failed'));
      
          // Call the function under test
          await orderController.changePageAdminCategory(req, res);
      
          // Expectations
          expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
      });
});