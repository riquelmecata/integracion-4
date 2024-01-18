import mongoose from "mongoose";
import ProductManager from "../DAL/dao/productManagerMongo.js";
import supertest from "supertest";
import * as chai from 'chai';
import env from "../config/config.js";

const { userDb, passwordDb } = env;

mongoose
  .connect(`mongodb+srv://${userDb}:${passwordDb}@cluster0.cjinh2b.mongodb.net/ecommerce?retryWrites=true&w=majority`);

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe('Testing Products API', () => {
    before(function () {
        this.productsDao = new ProductManager()
    })

    it("Debería devolver los productos de la DB", async function () {
        this.timeout(5000)
        try {
            const result = await this.productsDao.getProducts()
            expect(result).to.have.property('payload');
            expect(result.payload).to.be.an('array');
            expect(result.payload).to.not.have.lengthOf(0);            
        } catch(error) {
            console.error("Error durante el test: ", error)
        }

    }) 

    it("Debe agregar un producto en la DB", async function () {
        this.timeout(5000)
        let mockProduct = {
            title: "Camisa de Algodón",
            description: "Camisa de manga larga y corte clásico.",
            price: 2999,
            thumbnail: ["https://example.com/thumbnail.jpg"],
            code: "CM001",
            stock: 50,
            status: true,
            category: "Ropa",
            owner: "correo@prueba.cl"
        }
        const result = await this.productsDao.addProduct(mockProduct)
        expect(result).to.have.property('_id')
        expect(result).to.have.property('owner')
    })   

    it("Debe actualizar un producto", async function () {
        this.timeout(5000)
        let prodId = "651cd48efef520effdaae927"
        let mockProductUpd = {
            title: "Polera Updated 2",
            description: "Descrption Updated",
        }
        const result = await this.productsDao.updateProduct(prodId, mockProductUpd )
        expect(result).to.be.an('object') //Chai
    }) 

    it("Debe eliminar un producto", async function () {
        this.timeout(5000)
        let prodId = "659e242aca815214c9bd49c8"
        const result = await this.productsDao.deleteProduct(prodId)
        expect(result).to.be.an('object') //Chai
        expect(result).to.have.property('message', 'Producto eliminado con éxito'); //Chai
    })  
 
    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas de Product");
        done();
    });
})