import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({credentials: true}));


app.get("/", (req, res) => {
    res.send("Hello World!");
});


import authRouter from './routes/auth.route.js'
import ApiError from "./utils/ApiError.js";
import propertiesRouter from './routes/properties.route.js'
import tenantRouter from './routes/tenant.route.js'
import managerRouter from './routes/manager.route.js'
import leaseRouter from './routes/lease.route.js'
import applicationRouter from './routes/application.route.js';
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/properties',propertiesRouter);
app.use('/api/v1/tenants',tenantRouter);
app.use('/api/v1/managers',managerRouter);
app.use('/api/v1/leases',leaseRouter);
app.use('/api/v1/applications',applicationRouter);
app.use((err:ApiError,req:express.Request,res:express.Response,next:express.NextFunction)=>{
    return res.status(err.statusCode || 500).json({message:err.message})
})


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});