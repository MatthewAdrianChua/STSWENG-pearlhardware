import inventoryController from "../controllers/inventoryController.js";
import {Product} from "../model/productSchema.js";
import { User } from '../model/userSchema.js';
import { Order } from "../model/orderSchema.js";
import {jest} from '@jest/globals'
import { describe } from 'node:test';
import { Image } from "../model/imageSchema.js";

jest.mock('../model/productSchema.js');
jest.mock('../model/orderSchema.js');
jest.mock('../model/userSchema.js');
jest.mock('../model/refundSchema.js');
jest.mock('../model/refundImages.js');
jest.mock('node-fetch');

describe('inventory controller', () => {
    describe('getAdminInventory', () => {
        let req, res;
      
        beforeEach(() => {
          req = {
            params: {
              category: 'mockCategory'
            },
            session: {
              pageIndex: null,
              nextPage: true,
              prevPage: false,
              userID: 'mockUserID'
            },
            query: {
              sortBy: 'mockSortBy'
            }
          };
          res = {
            render: jest.fn(),
            sendStatus: jest.fn()
          };
    
        });
      
        afterEach(() => {
          jest.clearAllMocks(); // Clear all mocks after each test
        });
      
        it('should render adminInventory page with valid parameters', async () => {
    
          const product_list = [{ id: '1', name: 'Product 1', category: 'welding', price: 100, quantity: 10 }, { id: '2', name: 'Product 2', category: 'safety', price: 50, quantity: 20 }];
          jest.spyOn(Product, 'find').mockResolvedValue(product_list);
         
          jest.spyOn(User, 'findById').mockResolvedValue({ isAuthorized: true });
      
          await inventoryController.getAdminInventory(req, res);
      
          expect(User.findById).toHaveBeenCalledWith('mockUserID');
          expect(res.render).toHaveBeenCalledWith('adminInventory', {
            layout: 'adminInven',
            //product_list: product_list,
            script: '/./js/adminInventory.js',
            category: 'mockCategory',
            nextPage: true,
            prevPage: false
          });
        });
      
        it('should handle unauthorized user', async () => {
          // Mock User.findById to return unauthorized user
          User.findById = jest.fn().mockResolvedValue({ isAuthorized: false });
      
          // Call the function under test
          await inventoryController.getAdminInventory(req, res);
      
          // Expectations
          expect(User.findById).toHaveBeenCalledWith('mockUserID');
          expect(res.sendStatus).toHaveBeenCalledWith(400);
          expect(res.render).not.toHaveBeenCalled();
        });
      
        // Add more test cases as needed to cover all scenarios
      }),

      describe('addProduct', () => {
        let req, res;
    
        beforeEach(() => {
            req = {
                file: {
                    buffer: 'sampleBuffer',
                    mimeType: 'image/jpeg'
                },
                body: {
                    name: 'Test Product',
                    type: 'Test Type',
                    quantity: 10,
                    price: 100,
                    description: 'Test Description'
                }
            };
            res = {
                redirect: jest.fn(),
                sendStatus: jest.fn()
            };
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should add product with image', async () => {
            const imageSaveMock = { _id: 'imageId' };
            //Image.create.mockResolvedValue(imageSaveMock);
            jest.spyOn(Image, 'create').mockResolvedValue(imageSaveMock)
            //const mockSave = jest.fn(); // Create a mock function
            //Product.prototype.save = mockSave; // Mock the save function of Product model
            jest.spyOn(Product.prototype, 'save').mockResolvedValue()
    
    
            await inventoryController.addProduct(req, res);
    
            expect(Image.create).toHaveBeenCalledWith({
                img: {
                    data: Buffer.from('sampleBuffer', 'base64'),
                    contentType: 'image/jpeg'
                }
            });
    
            /*
            expect(Product.prototype).toHaveBeenCalledWith({
                name: 'Test Product',
                type: 'Test Type',
                quantity: 10,
                price: 100,
                productpic: 'http://localhost:3000/image/imageId',
                description: 'Test Description'
            });
            */
    
            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/Test Type');
        });
    
        it('should add product without image', async () => {
            req.file = undefined;

            jest.spyOn(Product.prototype, 'save').mockResolvedValue()
    
            await inventoryController.addProduct(req, res);
    
            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/Test Type');
        });
    }),

    describe('editProduct function', () => {
        let req, res;
    
        beforeEach(() => {
            // Mock req and res objects
            req = {
                file: {
                    buffer: 'sample-buffer', // Mocked file buffer
                    mimeType: 'image/jpeg' // Mocked file mimeType
                },
                body: {
                    id: 'product_id', // Mocked product id
                    name: 'Updated Product Name',
                    type: 'Updated Product Type',
                    stock: 50,
                    price: 99.99,
                    description: 'Updated product description'
                }
            };
    
            res = {
                sendStatus: jest.fn(),
                redirect: jest.fn()
            };
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should update product with image', async () => {

            jest.spyOn(Image, 'create').mockResolvedValue({ _id: 'image_id' });
            jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue();

            await inventoryController.editProduct(req, res);
    
            // Assertions
            expect(Image.create).toHaveBeenCalled();
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product_id', {
                name: 'Updated Product Name',
                type: 'Updated Product Type',
                quantity: 50,
                price: 99.99,
                productpic: 'https://pearl-hardware-ph.onrender.com/image/image_id',
                description: 'Updated product description'
            });
            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/allproducts');
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
    
        it('should update product without image', async () => {
            req.file = null; // Simulate no image

            jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue();
    
            await inventoryController.editProduct(req, res);
    
            // Assertions
            expect(Image.create).not.toHaveBeenCalled();
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('product_id', {
                name: 'Updated Product Name',
                type: 'Updated Product Type',
                quantity: 50,
                price: 99.99,
                description: 'Updated product description'
            });
            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/allproducts');
            expect(res.sendStatus).not.toHaveBeenCalled();
        });
    
        it('should handle errors', async () => {
            // Mock an error in Product.findByIdAndUpdate
           
            jest.spyOn(Product, 'findByIdAndUpdate').mockRejectedValue(new Error('Database error'))
    
            await inventoryController.editProduct(req, res);
    
            // Assertions
            expect(res.sendStatus).toHaveBeenCalledWith(500);
            expect(res.redirect).not.toHaveBeenCalled();
        });
    }),

    describe('searchInventory function', () => {
        let req, res;
    
        beforeEach(() => {
            // Mock req and res objects
            req = {
                query: {
                    product_query: 'search_query', // Mocked search query
                    sortBy: 'sort_criteria' // Mocked sort criteria
                }
            };
    
            res = {
                render: jest.fn()
            };
    
            // Mock sortProducts function
            sortProducts = jest.fn();
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should search inventory and render adminInventory template', async () => {

            const product = [{
                _id: '1',
                name: 'Product 1',
                type: 'Type 1',
                price: 10.99,
                quantity: 20,
                productpic: 'productpic1.jpg'
            }];

            jest.spyOn(Product, 'find').mockResolvedValue(product);

            await inventoryController.searchInventory(req, res);
    
            // Assertions
            expect(Product.find).toHaveBeenCalledWith(
                { name: new RegExp('.*' + 'search_query' + '.*', 'i') },
                { __v: 0 }
            );
        
            expect(res.render).toHaveBeenCalledWith('adminInventory', {
                layout: 'adminInven',
                product_list: [
                    {
                        name: 'Product 1',
                        type: 'Type 1',
                        price: 10.99,
                        quantity: 20,
                        productpic: 'productpic1.jpg',
                        p_id: '1'
                    },
                ],
                buffer: 'search_query'
            });
        });
    });


})
