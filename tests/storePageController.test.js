import storePageController from '../controllers/storePageController.js';
import { beforeEach, describe } from 'node:test';
import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { User } from '../model/userSchema.js';
import {jest} from '@jest/globals'

jest.useFakeTimers()

jest.mock('../model/db.js');
jest.mock('../model/productSchema.js');
jest.mock('../model/userSchema.js');

describe('Store Page Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    //getIndex
    describe('getIndex function', () => {
        test('should render index template with product list when successful', async () => {
            const req = { session: { userID: '65dd295eee3132fa6b85c2b2' } };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            const mockProductList = [{ name: 'Fan' }, { name: 'Cones' }];
            
            database.getProducts.mockResolvedValue(mockProductList);

            await storePageController.getIndex(req, res);

            expect(database.getProducts).toHaveBeenCalled();
            expect(res.render).toHaveBeenCalledWith('index', {
                product_list: mockProductList,
                script: './js/index.js',
                isHomePage: true,
            });
            expect(res.sendStatus).not.toHaveBeenCalled();

        test('should send status 400 when an error occurs', async () => {
            const req = { session: { userID: '65dd295eee3132fa6b85c2b2' } };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            const errorMessage = 'Test error';
            
            database.getProducts.mockRejectedValue(new Error(errorMessage));

            await storePageController.getIndex(req, res);

            expect(database.getProducts).toHaveBeenCalled();
            expect(res.render).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });

    //getCategory
    describe('getCategory function', () => {
        test('should render category template with product list for the specified category when successful', async () => {
            const req = { params: { category: 'allproducts' } };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            const mockProductList = [{ name: 'Fan' }, { name: 'Cones' }];
            
            database.getProductsByCategory.mockResolvedValue(mockProductList);

            await storePageController.getCategory(req, res);

            expect(database.getProductsByCategory).toHaveBeenCalledWith('testCategory');
            expect(res.render).toHaveBeenCalledWith('category', {
                product_list: mockProductList,
                script: './js/category.js',
                isHomePage: false,
            });
            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        test('should send status 400 when an error occurs', async () => {
            const req = { params: { category: 'allproducts' } };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            const errorMessage = 'Test error';
            
            database.getProductsByCategory.mockRejectedValue(new Error(errorMessage));

            await storePageController.getCategory(req, res);

            expect(database.getProductsByCategory).toHaveBeenCalledWith('testCategory');
            expect(res.render).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });

    //ChangePageStore
    describe('ChangePageStore function', () => {
        test('should update currentCategory and re-render the index template', async () => {
            const req = { query: { category: 'industrial' } };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            
            await storePageController.ChangePageStore(req, res);

            expect(storePageController.currentCategory).toBe('allproducts');
            expect(res.render).toHaveBeenCalledWith('index', {
                product_list: expect.any(Array),
                script: './js/index.js',
                isHomePage: true,
            });
            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        test('should send status 400 when category is not provided', async () => {
            const req = { query: {} };
            const res = { render: jest.fn(), sendStatus: jest.fn() };
            
            await storePageController.ChangePageStore(req, res);

            expect(storePageController.currentCategory).toBe('allproducts');
            expect(res.render).not.toHaveBeenCalled();
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });
    });

    //getProductDesc
    describe('getProductDesc function', () => {
        it('should render the product description page', () => {
            const req = {};
            const res = {
                render: jest.fn(),
            };

            storePageController.getProductDesc(req, res);

            expect(res.render).toHaveBeenCalledWith('productDesc');
        });
    });

    //searchProducts
    describe('searchProducts function', () => {
        it('should render the search results page with the correct products', async () => {
            const req = {
                query: {
                    product_query: 'test',
                    sortBy: 'def',
                },
            };
            const res = {
                render: jest.fn(),
            };
            const product_list = [
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Cones', price: 29.99, quantity: 10 },
            ];
            Product.find.mockResolvedValue({ lean: () => product_list });

            await storePageController.searchProducts(req, res);

            expect(Product.find).toHaveBeenCalledWith({ name: new RegExp('.*test.*', 'i'), isShown: true }, { __v: 0 });
            expect(sortProducts).toHaveBeenCalledWith(product_list, 'def');
            expect(res.render).toHaveBeenCalledWith('search_results', { product_list, buffer: 'test', script: '/./js/sort.js' });
        });
    });

    //getProduct
    describe('getProduct function', () => {
        it('should render the product page with the correct product data', async () => {
            const req = {
                query: {
                    id: '65dd277a12e1839879e499de',
                },
            };
            const res = {
                render: jest.fn(),
            };
            const product_result = {
                name: 'Fan',
                price: 199.99,
                quantity: 5,
                productpic: '/./uploads/industrial_fan.jpg',
                description: 'This is a test product.',
                _id: req.query.id,
            };
            Product.find.mockResolvedValue({ lean: () => product_result });

            await storePageController.getProduct(req, res);

            expect(Product.find).toHaveBeenCalledWith({ _id: req.query.id }, { __v: 0 });
            expect(res.render).toHaveBeenCalledWith('productDesc', { product: product_result, script: './js/add_to_cart.js' });
        });
    });

    //Helper Functions
    //sortProducts
    describe('sortProducts function', () => {
        let productList;

        beforeEach(() => {
            productList = [
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Cones', price: 29.99, quantity: 10 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
            ];
        });

        test('sorts products by default', () => {
            sortProducts(productList);
            expect(productList).toEqual([
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
                { name: 'Cones', price: 29.99, quantity: 10 },
            ]);
        });
        
        test('sorts products by price ascending', () => {
            sortProducts(productList, 'price_asc');
            expect(productList).toEqual([
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
                { name: 'Cones', price: 29.99, quantity: 10 },
            ]);
        });

        test('sorts products by price descending', () => {
            sortProducts(productList, 'price_desc');
            expect(productList).toEqual([
                { name: 'Cones', price: 29.99, quantity: 10 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
                { name: 'Fan', price: 199.99, quantity: 5 },
            ]);
        });
        
        test('sorts products by name ascending', () => {
            sortProducts(productList, 'name_asc');
            expect(productList).toEqual([
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Cones', price: 29.99, quantity: 10 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
            ]);
         });

        test('sorts products by name descending', () => {
            sortProducts(productList, 'name_desc');
            expect(productList).toEqual([
                { name: 'Glasses', price: 12.99, quantity: 50 },
                { name: 'Cones', price: 29.99, quantity: 10 },
                { name: 'Fan', price: 199.99, quantity: 5 },
            ]);
        });
    });

    //getProducts
    describe('getProducts function', () => {      
        let req;
        let res;
        let productList;

        beforeEach(() => {
            req = {
                session: {
                    pageIndex: 0,
                },
            };
            res = {
                render: jest.fn(),
            };
            productList = [
                { name: 'Fan', price: 199.99, quantity: 5 },
                { name: 'Cones', price: 29.99, quantity: 10 },
                { name: 'Glasses', price: 12.99, quantity: 50 },
            ];
            Product.find.mockResolvedValue({ lean: () => productList });
        });

        test('returns product list for all products', async () => {
            await getProducts(req, res);
            expect(Product.find).toHaveBeenCalledWith({}, { __v: 0 });
            expect(res.render).toHaveBeenCalledWith('index', {
                product_list: productList,
                script: './js/index.js',
                isHomePage: true,
            });
        });

        test('returns product list for a specific category', async () => {
            req.params = {
            category: 'welding',
            };
            await getProducts(req, res);
            expect(Product.find).toHaveBeenCalledWith({ type: 'welding' }, { __v: 0 });
            expect(res.render).toHaveBeenCalledWith('all_products', {
                product_list: productList,
                category: 'welding',
                script: '/./js/sort.js',
                nextPage: true,
                prevPage: false,
            });
        });

        test('returns product list with pagination', async () => {
            Product.find.mockResolvedValueOnce({ lean: () => productList.slice(0, 5) }).mockResolvedValueOnce({ lean: () => productList.slice(5) });
            req.session.pageIndex = 1;
            req.params = {
                category: 'welding',
            };
            await getProducts(req, res);
            expect(Product.find).toHaveBeenCalledWith({ type: 'welding' }, { __v: 0 });
            expect(res.render).toHaveBeenCalledWith('all_products', {
                product_list: productList.slice(5),
                category: 'welding',
                script: '/./js/sort.js',
                nextPage: false,
                prevPage: true,
            });
        });
    });
});