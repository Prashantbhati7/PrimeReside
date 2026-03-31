import { Request, Response } from "express";
import AsyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sql } from "../lib/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidbv4 } from 'uuid';
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export const register = AsyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber, role } = req.body;
    if (!name || !email || !password || !phoneNumber || !role) {
        throw new ApiError(400, "All fields are required");
    }

    let existingUsers: any[] = [];
    if (role.toLowerCase() === 'manager') {
        existingUsers = await sql`SELECT * FROM "Manager" WHERE email = ${email}`;
    } else if (role.toLowerCase() === 'tenant') {
        existingUsers = await sql`SELECT * FROM "Tenant" WHERE email = ${email}`;
    }

    if (existingUsers.length > 0) {
        throw new ApiError(400, "User already exists");
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const authId = uuidbv4();
    let registeredUser;

    if (role.toLowerCase() === 'manager') {
        const result = await sql`
            INSERT INTO "Manager" ("authId", "name", "email", "phoneNumber", "password")
            VALUES (${authId}, ${name}, ${email}, ${phoneNumber}, ${hashedPass})
            RETURNING *
        `;
        registeredUser = result[0];
    } else if (role.toLowerCase() === 'tenant') {
        const result = await sql`
            INSERT INTO "Tenant" ("authId", "name", "email", "phoneNumber", "password")
            VALUES (${authId}, ${name}, ${email}, ${phoneNumber}, ${hashedPass})
            RETURNING *
        `;
        registeredUser = result[0];
    }

    const token = jwt.sign(
        { sub: authId, role: role.toLowerCase() }, 
        process.env.JWT_SECRET || 'jwt-secret-random', 
        { expiresIn: "7d" }
    );
    const option:any = {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax",
        maxAge:60*60*24*7*1000
    }
    return res.status(201).cookie("token",token,option).json({ message: "User registered successfully", user: registeredUser,token });
})


export const login = AsyncHandler(async (req: Request, res: Response) => {
    console.log("login route is working ");
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
        throw new ApiError(400, "All fields are required");
    }
    console.log("email and password is ",email,password);
    let user: any = null;
    let userRole: string = '';
    
    // Check Tenant table first
    const tenants = await sql`SELECT * FROM "Tenant" WHERE email = ${email}`;
    console.log("tenants is ",tenants);
    if (tenants.length > 0) {
        user = tenants[0];
        userRole = 'tenant';
    } else {
        // Check Manager table
        const managers = await sql`SELECT * FROM "Manager" WHERE email = ${email}`;
        console.log("managers is ",managers);
        if (managers.length > 0) {
            user = managers[0];
            userRole = 'manager';
        }
    }

    if (!user) {
        console.log("user is not found ");
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    const token = jwt.sign(
        { sub: user.authId, role: userRole }, 
        process.env.JWT_SECRET || 'jwt-secret-random', 
        { expiresIn: "7d" }
    );
    const option:any = {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax",
        maxAge:60*60*24*7*1000
    }
    return res.status(200).cookie("token",token,option).json({ 
        message: "User logged in successfully", 
        user: { ...user, role: userRole } ,
        token:token
    });
})


export const logout = AsyncHandler(async(req:Request,res:Response)=>{
    return res.status(200).clearCookie("token").json({ message: "User logged out successfully" });
})