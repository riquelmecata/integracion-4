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
    

    getTicketById = async (req,res) => {
        try {
            if(req.session.user){
                const session = new SessionDTO(req.session)
                const {ticketId} = req.params
                const {cart} = session
                // const cartInfo = await cartsService.getCartById(cart)
                // const ticketInfo = await ticketsService.getTicketById(ticketId)
                const ticketInfo = session.ticketInfo 
                const cartInfo = session.cart
                res.render('purchaseEnded',{
                    ticket: ticketInfo,
                    cart: cartInfo,
                    purchasedProducts: ticketInfo.order,
                    purchasedAny: ticketInfo.order.length > 0,
                    insufficientStock: cartInfo.products,
                    purchasedAll: cartInfo.products.length === 0
                })
            }
        } catch (error) {
            res.send(error)
        }
    }

}

export default new ViewsController()
