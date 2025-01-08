"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// "start": "npx tsc && node build/app.js", //npm start
// "build" : "rimraf ./build && tsc",  //npm run build to compile the TypeScript code
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 5000;
require('./model/index');
app.get('/', (req, res) => {
    res.send('server connected');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
