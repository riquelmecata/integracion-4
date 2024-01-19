import fs from 'fs'
import { UserModel } from "../DAL/db/models/user.model.js";
import { tokenModel } from "../DAL/db/models/tokens.model.js";
import logger from "../services/winston/winston.js";
import { transporter } from "../config/nodemailerConfig.js";
import { hasher } from "../services/hasher.js";
import { hasherCompare } from "../services/hashercompare.js";

import crypto from 'crypto'
import { ProductsModel } from "../DAL/db/models/products.model.js";
import CustomError from '../services/errors/CustomError.js';
import { ErrorsCause, ErrorsMessage, ErrorsName } from '../services/errors/enum.js';

class UsersController {
    resetPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await UserModel.findOne({ email: email });
            if (!user) return logger.error('User with given email not found');
    
            let token = await tokenModel.findOne({ userId: user._id });
            if (!token) {
                token = await new tokenModel({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString('hex'),
                }).save();
            }
    
            const link = `http://localhost:8080/createNewPassword/${user._id}/${token.token}`;
    
            const mailOptions = {
                from: `"Prueba" <riquelmecata@gmail.com>`,
                to: user.email,
                subject: 'Resetear contraseña',
                template: 'emailPasswordReset',
                context: {
                    link: link,
                },
            };
    
            // Enviar el correo electrónico utilizando transporter.sendMail
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send('Error al enviar el correo electrónico');
                }
                // Preparar la respuesta que incluye detalles del correo enviado
                const emailDetails = {
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    link: link,
                    // Otros detalles relevantes que desees incluir
                };
    
                // Enviar una respuesta con los detalles del correo electrónico enviado
                res.send(`Se ha enviado un correo a ${emailDetails.to} con el enlace para resetear la contraseña`);
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req,res) => {
        const user = await UserModel.findById(req.session.user._id)
        user.last_connection = Date.now()
        await user.save()
        req.session.destroy(error => {
            if(error){
                console.log(error);
            } else {
                res.redirect('/')
            }
        })
    }

    createNewPassword = async (req,res, next) => {
        try {
            const {userId, token} = req.params
            logger.debug(userId)
            logger.debug(token)
            const {password} = req.body
            console.log(password);
            const user = await UserModel.findById(userId)

            if(!user) return logger.error('User with given email not found')

            const tokenDB = await tokenModel.findOne({
                userId: user._id,
                token: token
            })

            if(!tokenDB) return logger.error('Invalid or expired token')

            const passwordMatch = await hasherCompare(password, user.password)
            if(passwordMatch){
                res.send('La contraseña debe ser distinta a la que ya tenias')
            } else {
                user.password = await hasher(password)
                await user.save()
                await tokenModel.deleteOne({token: token})
                res.send('Contraseña reseteada')
            }
        } catch (error) {
            next(error)
        }
    }

    setPremium = async (req,res, next) => {
        try {
            const {userId} = req.params
            const user = await UserModel.findById(userId)
            const canGetPremium = () => {
                const id = user.documents.some(doc => doc.docType === "id")
                const account = user.documents.some(doc => doc.docType === "account")
                const adress = user.documents.some(doc => doc.docType === "adress")

                if (id && adress && account) {
                    return true
                } else {
                    return false
                }
            }
            const updatedRole = user.role === "user" ? "premium" : "user"
            if(canGetPremium() && user.role === "user"){
                const result = await UserModel.updateOne({_id: userId}, {
                    $set: {
                        role: updatedRole
                    }
                })
                res.send(result)
            } else {
                CustomError.createCustomError({
                    name: ErrorsName.DOCUMENTS_ERROR,
                    cause: ErrorsCause.DOCUMENTS_ERROR,
                    message: ErrorsMessage.DOCUMENTS_ERROR,
                })
            }
        } catch (error) {
            next(error)
        }
    }


    deleteOwnProduct = async (req,res,next) => {
        try {
            const {prodId} = req.params
            const result = await ProductsModel.deleteOne({_id: prodId})
            res.send(result)
        } catch (error) {
            next(error)
        }
    }

    uploadDocument = async (req,res,next) => {
        try {
            const file = req.file
            const uploadType = req.body.uploadType
            let folder
            if(uploadType === "id" || uploadType === "account" || uploadType === "adress"){
                folder = "documents"
            } else {
                folder = uploadType
            }
            if(file){
                fs.renameSync(file.path, file.destination+'/'+folder+'/'+req.user._id+'-'+uploadType+'-'+file.originalname)
            }
            const document = {
                name: req.user._id+'-'+uploadType+'-'+file.originalname,
                reference: file.destination+'/'+folder,
                docType: uploadType,
            }
            const user = await UserModel.findById(req.user._id)
            if(file && user){
                user.documents.push(document)
                await user.save()
            }
            res.send(document)
        } catch (error) {
            next(error)
        }
    }
}

export default new UsersController