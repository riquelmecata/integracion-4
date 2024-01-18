import mongoose from "mongoose";
import UserManager from "../DAL/dao/userManager.js";
import supertest from "supertest";
import * as chai from 'chai';
import env from "../config/config.js";

const { userDb, passwordDb } = env;

mongoose
  .connect(`mongodb+srv://${userDb}:${passwordDb}@cluster0.cjinh2b.mongodb.net/ecommerce?retryWrites=true&w=majority`);

const expect = chai.expect;
const requester = supertest("http://localhost:8080");

describe('Testing Sessions API', () => {
    before(function () {
        this.usersDao = new UserManager()
    })

    it("Debe agregar a un usuario en la DB", async function () {
        this.timeout(5000)
        let mockUser = {
            first_name: "Test First Name",
            last_name: "Test Last Name",
            email: "Test Email",
            age: 40,
            password: "Test Password",
            rol: "user"
        }
        const result = await this.usersDao.createUser(mockUser)
        expect(result).to.have.property('success')
        expect(result.success).to.have.property('_id')
    })

    it("Debe devolver un usuario despues de colocar un correo", async function () {
        this.timeout(5000)
        let emailToFind = "riquelmecata@gmail.com"
        const result = await this.usersDao.findUserByEmail({ email: emailToFind })
        expect(result).to.be.an('object') 
    })
 
    after(function(done) {
        this.timeout(5000);
        console.log("Fin de las pruebas de Sessions");
        done();
    });
})