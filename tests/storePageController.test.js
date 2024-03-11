import { beforeEach, describe } from 'node:test';
import database from '../model/db.js';
import { Product } from '../model/productSchema.js';
import { User } from '../model/userSchema.js';

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
            const mockProductList = [{ name: 'Wire' }, { name: 'Broom' }];
            
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
            const mockProductList = [{ name: 'Wire' }, { name: 'Broom' }];
            
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
            const req = { query: { category: 'testCategory' } };
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

    });

    //searchProducts
    describe('searchProducts function', () => {

    });

    //getProduct
    describe('getProduct function', () => {

    });

    //Helper Functions
    //sortProducts
    describe('sortProducts function', () => {

    });

    //getProducts
    describe('getProducts function', () => {

    });
});