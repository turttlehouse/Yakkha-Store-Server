"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    db: 'EcommerceDb',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 10000
    }
};
exports.default = dbConfig;
