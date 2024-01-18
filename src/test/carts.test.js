import mongoose from "mongoose";
import CartManagerDB from "../DAL/dao/cartManagerMongo.js";
import supertest from "supertest";
import * as chai from 'chai';
import env from "../config/config.js";

const { userDb, passwordDb } = env;

mongoose
  .connect(`mongodb+srv://${userDb}:${passwordDb}@cluster0.cjinh2b.mongodb.net/ecommerce?retryWrites=true&w=majority`);

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe('Testing Carts API', () => {
    before(function () {
        this.cartsDao = new CartManagerDB()
    })

    it("Debe agregar un carrito en la DB", async function () {
        this.timeout(5000)
        try {
            let mockCart = {
                products: [
                    {
                        item: '6521c5ded7b1040b9f43c270',
                        qty: 7
                    }
                ]
            }
            const result = await this.cartsDao.createCart(mockCart)
            expect(result).to.have.property('products')
            expect(result).to.have.property('_id')
        } catch(error) {
            console.error("Error durante el test: ", error)
        }

    })

    it("Debería devolver un carrito por el id desde la DB", async function () {
        this.timeout(5000)
        try {
            let idCart = '651cd552fef520effdaae934'
            const result = await this.cartsDao.getCartById(idCart)
            expect(result).to.have.property('_id') // Chai
        } catch(error) {
            console.error("Error durante el test: ", error)
        }
    })

    it('Agregar producto al carrito', async function () {
        this.timeout(5000)
        try {
            let idCart = '651cd552fef520effdaae934';
            let idProduct = '651cd48efef520effdaae927';
            const result = await this.cartsDao.updateCart(idCart, idProduct);
            expect(result).to.have.property('_id'); // Chai
        } catch(error) {
            console.error("Error durante el test: ", error);
        }
    }); 

    it('Vaciar carrito', async function () {
        this.timeout(5000)
        try {
            let idCart = '651cd552fef520effdaae934';
            const result = await this.cartsDao.cartCleaner(idCart);
            expect(result).to.have.property('_id')
            expect(result).to.have.property('products')
            expect(result.products).to.be.an('array')
            expect(result.products).to.have.lengthOf(0)
        } catch(error) {
            console.error("Error durante el test: ", error);
        }
        
    });

    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas de Cart");
        done();
    });
})