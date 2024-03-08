import inventoryController from '../controllers/inventoryController.js';
import { Product } from '../model/productSchema.js';
import { Image } from '../model/imageSchema.js';
import { User } from '../model/userSchema.js';
import {jest} from '@jest/globals'
import { beforeEach, describe } from 'node:test';

jest.useFakeTimers()

// Mock models
jest.mock('../model/productSchema.js'); // Mocking the Product model
jest.mock('../model/imageSchema.js'); // Mocking the Image model
jest.mock('../model/userSchema.js'); // Mocking the User model

describe('Inventory controller', () => {

    // TODO: getAdminInventory
    describe('getAdminInventory function', () => {
        let req, res;

        beforeEach(() => {
            req = {
                params: { category: 'allproducts' },
                session: {
                    pageIndex: null,
                    nextPage: null,
                    prevPage: null,
                    userID: 'someAuthID'
                },
                query: { sortBy: 'def' }
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn(),
                redirect: jest.fn()
            };
            // helpers
            getProductsAdmin = inventoryController.getProductsAdmin;
            sortProducts = inventoryController.sortProducts;

            // //mocks of helpers
            // inventoryController.getProductsAdmin = jest.fn(() => 'mocked result');
            // inventoryController.sortProducts = jest.fn(() => 'mocked result');
            
        });

        afterEach(() => {
            jest.clearAllMocks();

            // reset helpers
            inventoryController.getProductsAdmin = getProductsAdmin;
            inventoryController.sortProducts = sortProducts;
        });

        // TODO: user is authorized, render inventory page
        it('should render the inventory page', async () => {
            const authUser = {
                _id: 'AuthID',
                isAuthorized: true
            };
            const session = {
                _id: 'someSessionID',
                session: {
                    userID: authUser._id
                }
            }
            const category = 'allproducts'
            const sortValue = 'def'
            const product_list = []

            //mocks of helpers
            inventoryController.getProductsAdmin = jest.fn(() => {
                
            });
            inventoryController.sortProducts = jest.fn(() => {
                
            });

            expect(inventoryController.getProductsAdmin).toHaveBeenCalled();
            expect(inventoryController.sortProducts).toHaveBeenCalled();

            jest.spyOn(User, 'findById').mockResolvedValue(session);

            await inventoryController.getAdminInventory(req, res);

            expect(res.render).toHaveBeenCalledWith('adminInventory', {
                layout: 'adminInven',
                product_list: product_list,
                script: '/./js/adminInventory.js',
                category: 'allproducts',
                nextPage: true,
                prevPage: false
            });
            expect(res.sendStatus).not.toHaveBeenCalled();

        });

        // TODO: user is unauthorized, status 400
        it('should return status 400, user is unauthorized', async () => {
            res.render.mockImplementation(() => { throw new Error(); });
            
            await inventoryController.getAdminInventory(req, res);

            expect(res.render).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });


    });


    // TODO: addProduct
    describe('addProduct function', () => {
        let req, res;

        beforeEach(() => {
            req = {};
            res = {
                redirect: jest.fn(),
                render: jest.fn(),
                sendStatus: jest.fn()
            };
            // helpers
            getProductsAdmin = inventoryController.getProductsAdmin;
            sortProducts = inventoryController.sortProducts;
        });

        afterEach(() => {
            jest.clearAllMocks();
            // reset helpers
            inventoryController.getProductsAdmin = getProductsAdmin;
            inventoryController.sortProducts = sortProducts;
        });

        // TODO: successfully add product
        it('should successfully add product', async () => {
            const pic = { req: {} };
            const product = { req: { body: { id: 'someProductID', type: 'welding' } } };

            const obj = {
                img: {}
            }

            jest.spyOn(Image, 'create').mockResolvedValue(obj);
            jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(product);

            await inventoryController.addProduct(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/welding');

        });

        // TODO: error sends status 400
        it('should send status 400 if an error occurs', async () => {
            //Mock an error occurring
            res.render.mockImplementation(() => { throw new Error(); });
            await inventoryController.addProduct(req,res);
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });

    });


    // TODO: editProduct
    describe('editProduct function', () => {
        let req, res;

        beforeEach(() => {
            req = {};
            res = {
                redirect: jest.fn(),
                sendStatus: jest.fn(),
                render: jest.fn()
            };
            // helpers
            getProductsAdmin = inventoryController.getProductsAdmin;
            sortProducts = inventoryController.sortProducts;
        });

    afterEach(() => {
        jest.clearAllMocks();

        // reset helpers
        inventoryController.getProductsAdmin = getProductsAdmin;
        inventoryController.sortProducts = sortProducts;
    });

        // TODO: successfully edit product
        it('should successfully edit product details', async () => {
            const pic = { req: {} };
            const product = { req: { body: { id: 'someProductID' } } };
            const currentCategory = 'allproducts';

            const obj = {
                img: {}
            }

            jest.spyOn(Image, 'create').mockResolvedValue(obj);
            jest.spyOn(Product, 'findByIdAndUpdate').mockResolvedValue(product);

            await inventoryController.addProduct(req, res);

            expect(res.redirect).toHaveBeenCalledWith('/adminInventory/' + currentCategory);
        });

        // TODO: error sends status 400
        it('should successfully edit product details', async () => {
            //Mock an error occurring
            res.render.mockImplementation(() => { throw new Error(); });
            await inventoryController.editProduct(req,res);
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });

    });


    // TODO: searchInventory
    describe('searchInventory function', () => {
        let req, res;

        beforeEach(() => {
            req = {
                query: {
                    product_query: "Gloves",
                    sortBy: 'def'
                }
            };

            res = {
                render: jest.fn()
            };
            // helpers
            getProductsAdmin = inventoryController.getProductsAdmin;
            sortProducts = inventoryController.sortProducts;
        });

        afterEach(() => {
            jest.clearAllMocks();
            
            // reset helpers
            inventoryController.getProductsAdmin = getProductsAdmin;
            inventoryController.sortProducts = sortProducts;
        });
    
        // TODO: display products with "Gloves"
        it('should render inventory page with only "Gloves" product', async () => {
            // const query = { name: "Gloves" }
            // req.query.product_query = "Gloves"
            const mockQuery = "Gloves";
            const req = { query: { product_query: mockQuery } };

            jest.spyOn(Product, 'find').mockResolvedValue(mockQuery);

            await inventoryController.searchInventory(req, res);
            expect(res.render).toContain("Gloves");
        });

        // TODO: display products with "Gloves" in descending order
        it('should render inventory page with only "Gloves" product in descending order', async () => {
            const mockQuery = "Gloves";
            const req = { query: {
                product_query: mockQuery,
                sortBy: 'price_desc'
            } };

            jest.spyOn(Product, 'find').mockResolvedValue(mockQuery);
            jest.spyOn(inventoryController, 'sortProducts').mockResolvedValue(req);

            await inventoryController.searchInventory(req, res);
            expect(res.render).toContain("Gloves");

        });

        // TODO: display no products found as product does not exist
        it('should render inventory page with an error message for no products found', async () => {
            const mockQuery = "Kuromi";
            const req = { query: {
                product_query: mockQuery,
                sortBy: 'price_desc'
            } };

            jest.spyOn(Product, 'find').mockResolvedValue(mockQuery);
            jest.spyOn(inventoryController, 'sortProducts').mockResolvedValue(req);

            await inventoryController.searchInventory(req, res);
            expect(res.render).not.toContain("Kuromi");
        });
    
    });



});