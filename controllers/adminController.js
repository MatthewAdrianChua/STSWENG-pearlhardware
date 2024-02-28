//This is the controller for admin operations but
//orders and inventory are in their own controller.
import database from '../model/db.js';
import { User } from '../model/userSchema.js';


const adminController = {
	getAdmin: async function (req, res) {
        try {
            if (req.session.userID) {
                const user = await User.findById(req.session.userID)
                if (user.isAuthorized == true) {
                    console.log("AUTHORIZED")
                    res.render("adminHome", {
                        layout: 'adminHome',
                        script: './js/admin.js',
                    });
                } else {
                    console.log("UNAUTHORIZED");
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);
            }
        } catch {
            res.sendStatus(400);
        }
    }

}

export default adminController;