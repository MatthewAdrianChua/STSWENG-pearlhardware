import adminController from '../controllers/adminController';
import { User } from '../model/userSchema';
import { jest } from '@jest/globals';

jest.mock('../model/userSchema.js', () => ({
    User: {
        findById: jest.fn(),
    },
}));

describe('adminController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            session: {
                userID: 'mockUserID',
            }
        };
        res = {
            render: jest.fn(),
            sendStatus: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render adminHome if user is authorized', async () => {
        const mockUser = {
            _id: 'mockUserID',
            isAuthorized: true,
        };
        jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser);

        await adminController.getAdmin(req, res);

        expect(User.findById).toHaveBeenCalledWith('mockUserID');
        expect(res.render).toHaveBeenCalledWith('adminHome', {
            layout: 'adminHome',
            script: './js/admin.js',
        });
        expect(res.sendStatus).not.toHaveBeenCalled();
    });

    it('should send status 400 if user is unauthorized', async () => {
        const mockUser = {
            _id: 'mockUserID',
            isAuthorized: false,
        };
        jest.spyOn(User, 'findById').mockResolvedValueOnce(mockUser);

        await adminController.getAdmin(req, res);

        expect(User.findById).toHaveBeenCalledWith('mockUserID');
        expect(res.sendStatus).toHaveBeenCalledWith(400);
        expect(res.render).not.toHaveBeenCalled();
    });

    it('should send status 400 if session.userID is undefined', async () => {
        req.session.userID = undefined;

        await adminController.getAdmin(req, res);

        expect(User.findById).not.toHaveBeenCalled();
        expect(res.sendStatus).toHaveBeenCalledWith(400);
        expect(res.render).not.toHaveBeenCalled();
    });

    it('should send status 400 if an error occurs', async () => {
        jest.spyOn(User, 'findById').mockRejectedValueOnce(new Error('Database error'));

        await adminController.getAdmin(req, res);

        expect(User.findById).toHaveBeenCalledWith('mockUserID');
        expect(res.sendStatus).toHaveBeenCalledWith(400);
        expect(res.render).not.toHaveBeenCalled();
    });
});
