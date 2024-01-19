import { Router } from "express";
import passport from "passport";
import UsersController from "../../controller/user.controller.js";

import { uploader } from "../../services/uploader.js";

export const router = Router();

router.post('/register', passport.authenticate('register', {
     failureRedirect: '/registerError',
     successRedirect: '/',
     passReqToCallback: true,
}))

router.post('/login', passport.authenticate('login'), async (req,res) => {
     req.session.user = req.user
     res.redirect('/products')
 })


router.get('/github/auth', passport.authenticate('githubAuth', {scope: [ 'user:email' ] }))
router.get('/github/callback', passport.authenticate('githubAuth'), async (req,res) => {
     req.session.user = req.user
     res.redirect('/products')
 })

router.get('/logout', UsersController.logout)

router.post('/resetpassword', UsersController.resetPassword)

router.post('/:userId/documents', uploader.single('file'), UsersController.uploadDocument)

router.post('/premium/:userId', UsersController.setPremium)

router.delete('/premium/:userId/products/:prodId', UsersController.deleteOwnProduct)

router.post('/createNewPassword/:userId/:token', UsersController.createNewPassword)