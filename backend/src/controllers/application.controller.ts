import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import AsyncHandler from "../utils/asyncHandler.js";
import { sql } from "../lib/db.js";
import ApiError from "../utils/ApiError.js";

export const createApplication = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const {
        applicationDate,
        status,
        propertyId,
        tenantAuthId,
        name,
        email,
        phoneNumber,
        message
    } = req.body;

    // 1. Fetch property to get rent and deposit
    const [property] = await sql`
        SELECT "pricePerMonth", "securityDeposit" 
        FROM "Property" 
        WHERE id = ${propertyId}
    `;

    if (!property) {
        throw new ApiError(404, "Property not found");
    }

    // 2. Run Atomic Transaction using CTE
    const result = await sql`
        WITH inserted_lease AS (
            INSERT INTO "Lease" (
                "startDate", "endDate", "rent", "deposit", "propertyId", "tenantAuthId"
            )
            VALUES (
                CURRENT_TIMESTAMP, 
                CURRENT_TIMESTAMP + interval '1 year', 
                ${property.pricePerMonth}, 
                ${property.securityDeposit}, 
                ${propertyId}, 
                ${tenantAuthId}
            )
            RETURNING *
        ),
        inserted_app AS (
            INSERT INTO "Application" (
                "applicationDate", "status", "name", "email", "phoneNumber", "message", "propertyId", "tenantAuthId", "leaseId"
            )
            VALUES (
                ${applicationDate}, 
                ${status}, 
                ${name}, 
                ${email}, 
                ${phoneNumber}, 
                ${message}, 
                ${propertyId}, 
                ${tenantAuthId}, 
                (SELECT id FROM inserted_lease)
            )
            RETURNING *
        )
        SELECT 
            a.*,
            json_build_object(
                'id', l.id, 
                'startDate', l."startDate", 
                'endDate', l."endDate", 
                'rent', l.rent, 
                'deposit', l.deposit
            ) as lease,
            json_build_object(
                'id', p.id, 
                'name', p.name, 
                'pricePerMonth', p."pricePerMonth"
            ) as property,
            json_build_object(
                'id', t.id, 
                'authId', t."authId", 
                'name', t.name, 
                'email', t.email
            ) as tenant
        FROM inserted_app a
        JOIN inserted_lease l ON a."leaseId" = l.id
        JOIN "Property" p ON a."propertyId" = p.id
        JOIN "Tenant" t ON a."tenantAuthId" = t."authId"
    `;

    if (!result || result.length === 0) {
        throw new ApiError(500, "Failed to create application");
    }

    return res.status(201).json(result[0]);
})

export const listApplication = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const userAuthId = req.user?.id;
    const role = req.user?.role;

    let query;
    if (role === 'manager') {
        query = sql`
            SELECT 
                a.*,
                json_build_object('id', p.id, 'name', p.name, 'pricePerMonth', p."pricePerMonth") as property,
                json_build_object('id', t.id, 'authId', t."authId", 'name', t.name) as tenant
            FROM "Application" a
            JOIN "Property" p ON a."propertyId" = p.id
            JOIN "Tenant" t ON a."tenantAuthId" = t."authId"
            WHERE p."managerAuthId" = ${userAuthId}
        `;
    } else {
        query = sql`
            SELECT 
                a.*,
                json_build_object('id', p.id, 'name', p.name, 'pricePerMonth', p."pricePerMonth") as property,
                json_build_object('id', t.id, 'authId', t."authId", 'name', t.name) as tenant
            FROM "Application" a
            JOIN "Property" p ON a."propertyId" = p.id
            JOIN "Tenant" t ON a."tenantAuthId" = t."authId"
            WHERE a."tenantAuthId" = ${userAuthId}
        `;
    }

    const applications = await query;
    return res.status(200).json(applications);
})

export const updateApplicationStatus = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const { id } = req.params;
    const { status } = req.body;

    // 1. Fetch current application details
    const [application] = await sql`
        SELECT a.*, p."pricePerMonth", p."securityDeposit", t.id as "tenantIntId"
        FROM "Application" a
        JOIN "Property" p ON a."propertyId" = p.id
        JOIN "Tenant" t ON a."tenantAuthId" = t."authId"
        WHERE a.id = ${Number(id)}
    `;

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    let updatedResult;

    if (status === "Approved") {
        // 2. Atomic approval process using CTE
        updatedResult = await sql`
            WITH new_lease AS (
                INSERT INTO "Lease" (
                    "startDate", "endDate", "rent", "deposit", "propertyId", "tenantAuthId"
                ) VALUES (
                    CURRENT_TIMESTAMP, 
                    CURRENT_TIMESTAMP + interval '1 year', 
                    ${application.pricePerMonth}, 
                    ${application.securityDeposit}, 
                    ${application.propertyId}, 
                    ${application.tenantAuthId}
                ) RETURNING id
            ),
            update_prop_tenant AS (
                INSERT INTO "_TenantProperties" ("A", "B")
                VALUES (${application.propertyId}, ${application.tenantIntId})
                ON CONFLICT DO NOTHING
                RETURNING *
            ),
            update_app AS (
                UPDATE "Application" 
                SET "status" = ${status}, "leaseId" = (SELECT id FROM new_lease)
                WHERE id = ${Number(id)}
                RETURNING *
            )
            SELECT 
                a.*,
                json_build_object(
                    'id', l.id, 
                    'startDate', l."startDate", 
                    'endDate', l."endDate", 
                    'rent', l.rent, 
                    'deposit', l.deposit
                ) as lease,
                json_build_object(
                    'id', p.id, 
                    'name', p.name, 
                    'pricePerMonth', p."pricePerMonth"
                ) as property,
                json_build_object(
                    'id', t.id, 
                    'authId', t."authId", 
                    'name', t.name
                ) as tenant
            FROM update_app a
            JOIN "Lease" l ON a."leaseId" = l.id
            JOIN "Property" p ON a."propertyId" = p.id
            JOIN "Tenant" t ON a."tenantAuthId" = t."authId"
        `;
    } else {
        // Simple status update (Denied / Pending)
        updatedResult = await sql`
            UPDATE "Application" 
            SET "status" = ${status} 
            WHERE id = ${Number(id)}
            RETURNING *
        `;
    }

    if (!updatedResult || updatedResult.length === 0) {
        throw new ApiError(500, "Failed to update application status");
    }

    return res.status(200).json(updatedResult[0]);
})