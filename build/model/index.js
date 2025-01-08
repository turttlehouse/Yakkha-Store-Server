"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const sequelize = new sequelize_1.Sequelize(dbConfig_1.default.db, dbConfig_1.default.user, dbConfig_1.default.password, {
    host: dbConfig_1.default.host,
    dialect: dbConfig_1.default.dialect,
    port: 3306,
    pool: {
        max: dbConfig_1.default.pool.max,
        min: dbConfig_1.default.pool.min,
        idle: dbConfig_1.default.pool.idle,
        acquire: dbConfig_1.default.pool.acquire
    }
});
sequelize
    .authenticate()
    .then(() => {
    console.log('Database connected successfully');
})
    .catch((err) => {
    console.log('Error connecting to database : ', err);
});
//initializing empty object
const db = {};
//adding 2 keys 
db.Sequelize = sequelize_1.Sequelize;
db.sequelize = sequelize;
//force : 1 /0 
db.sequelize.sync({ force: false })
    .then(() => {
    console.log('Database synchronized successfully : migration completed');
});
exports.default = db;
