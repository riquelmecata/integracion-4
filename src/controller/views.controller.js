import { tokenModel } from '../DAL/db/models/tokens.model.js'
import SessionDTO from '../dto/UsersDTO/session.dto.js'

class ViewsController {

    resetPassword = async (req, res) => {
        try {
            res.render('passwordReset')
        } catch (error) {
            res.send(error)
        }
    }

    createNewPassword = async (req,res) => {
        try {
            const {userId, token} = req.params
            const tokenDB = await tokenModel.findOne({
                userId: userId,
                token: token
            })

            if(!tokenDB){
                res.render('expiredLink')
            } else {
                res.render('createNewPassword', {
                    userId: userId,
                    token: token
                })
            }
        } catch (error) {
            res.send(error)
        }
    }

    uploadDocs = async (req, res) => {
        try {
            // Log the session information for debugging
/*             console.log('Session User upl docs:', req.user); */
    
            const userId = req.user._id;
            const cart = req.user.cart;
            
            res.render('uploadDocument', {
                cart: cart,
                userId: userId,
            });
        } catch (error) {
            res.send(error);
        }
    };

}

export default new ViewsController()
