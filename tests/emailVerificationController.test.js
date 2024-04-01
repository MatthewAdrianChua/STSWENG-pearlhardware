import emailVerificationController from '../controllers/emailVerificationController.js';
import exp from 'constants';
import database from '../model/db.js';
import { User } from '../model/userSchema.js';
import bcrypt from 'bcrypt';
import { Verification } from '../model/verificationSchema.js';
import { describe } from 'node:test';
import { jest } from '@jest/globals';

jest.mock('../model/verificationSchema.js');
jest.mock('../model/userSchema.js');
const req = {
    query: {
        t: 'userID',
        s: 'hashValue'
    }
};

// Mocking the renderErrorPage function
jest.mock('../controllers/emailVerificationController.js', () => ({
    renderErrorPage: jest.fn(),
}));

describe('Email Verification Controller', () => {
    //getEmailVerify
    describe('getEmailVerify', () => {
        let req, res;

        beforeEach(() => {
            req = {
                query: {
                    sk: 'true',
                },
            };
            res = {
                render: jest.fn(),
                sendStatus: jest.fn(),
            };
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should render emailVerify template with skipped set to true', async () => {
            await emailVerificationController.getEmailVerify(req, res);

            expect(res.render).toHaveBeenCalledWith('emailVerify', {
                skipped: true,
                script: './js/emailVerify.js',
            });
            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        it('should handle errors by sending status 400', async () => {
            const mockError = new Error('Test error');
            res.render.mockImplementationOnce(() => { throw mockError });

            try {
                await emailVerificationController.getEmailVerify(req, res);
            } catch (error) {
                expect(error).toBe(mockError); // Ensure the error thrown matches the mockError
                expect(res.sendStatus).toHaveBeenCalledWith(400);
                expect(res.render).toHaveBeenCalledTimes();
            }
        });
    });

    //getVerify
    describe('getVerify', () => {
        let req, res;
      
        beforeEach(() => {
            req = {
                query: { t: 'userID', s: 'someHashValue' },
            };
            res = {
                render: jest.fn(),
                redirect: jest.fn(),
            };
        });
      
        afterEach(() => {
            jest.clearAllMocks();
        });
      
        // it('should handle valid verification', async () => {
        //     const verification = [{ expires: Date.now() + 1000, hash: 'hashedValue' }];
        //     jest.spyOn(Verification, 'find').mockResolvedValueOnce(verification);
        //     jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce();
        
        //     await emailVerificationController.getVerify(req, res);
        
        //     expect(Verification.find).toHaveBeenCalledWith({ userID: 'userID' });
        //     expect(User.findByIdAndUpdate).toHaveBeenCalledWith('userID', { isVerified: true });
        //     expect(Verification.deleteOne).toHaveBeenCalled();
        //     expect(res.redirect).toHaveBeenCalledWith('/');
        // });
      
        // it('should handle expired verification link', async () => {
        //     const verification = [{ expires: Date.now() - 1000 }];
        //     jest.spyOn(Verification, 'find').mockResolvedValueOnce(verification);

        //     await emailVerificationController.getVerify(req, res);
        
        //     expect(Verification.find).toHaveBeenCalledWith({ userID: 'userID' });
        //     expect(res.render).toHaveBeenCalledWith('emailVerify', {
        //         error: true,
        //         err_message: 'Verification link has expired! Press the button below to recieve another verification email.',
        //         err_code: 32,
        //         script: './js/emailVerify.js',
        //     });
        // });
      
        // it('should handle invalid verification link', async () => {
        //     const verification = [{ expires: Date.now() + 1000, hash: 'hashedValue' }];
        //     jest.spyOn(Verification, 'find').mockResolvedValueOnce(verification);
        //     jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValueOnce();
        
        //     // Simulating a failed hash comparison
        //     jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
        
        //     await emailVerificationController.getVerify(req, res);
        
        //     expect(Verification.find).toHaveBeenCalledWith({ userID: 'userID' });
        //     expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        //     expect(Verification.deleteOne).toHaveBeenCalled();
        //     expect(res.render).toHaveBeenCalledWith('emailVerify', {
        //         error: true,
        //         err_message: 'Error verifying account! Please try again. Error code: 36',
        //         err_code: 36,
        //         script: './js/emailVerify.js',
        //     });
        // });
      
        it('should handle errors gracefully', async () => {
            jest.spyOn(Verification, 'find').mockRejectedValueOnce(new Error('Test error'));
        
            await emailVerificationController.getVerify(req, res);
        
            expect(Verification.find).toHaveBeenCalledWith({ userID: 'userID' });
            expect(res.render).toHaveBeenCalledWith('emailVerify', {
                error: true,
                err_message: 'No valid record was found or has been verified already! Please sign up or log in.',
                err_code: 37,
                script: './js/emailVerify.js',
            });
        });
    });
});