import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import AsyncHandler from "../utils/asyncHandler.js";
import { sql } from "../lib/db.js";
import ApiError from "../utils/ApiError.js";


export const getALLTenants = AsyncHandler(async(req:Request,res:Response)=>{
    const tenants = await sql`SELECT * FROM "Tenant"`;
    return res.status(200).json({"message":"tenants fetched successfully",tenants});
})


export const getTenantById = AsyncHandler(async(req:Request,res:Response)=>{
    try {
        const { authId } = req.params;
        const query = await sql`
            SELECT 
                t.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', p.id,
                                'name', p.name,
                                'description', p.description,
                                'pricePerMonth', p."pricePerMonth",
                                'photoUrls', p."photoUrls",
                                'beds', p.beds,
                                'baths', p.baths,
                                'squareFeet', p."squareFeet",
                                'location', json_build_object(
                                    'id', l.id,
                                    'address', l.address,
                                    'city', l.city,
                                    'state', l.state,
                                    'coordinates', json_build_object(
                                        'longitude', ST_X(l."coordinates"::geometry),
                                        'latitude', ST_Y(l."coordinates"::geometry)
                                    )
                                )
                            )
                        )
                        FROM "Property" p
                        LEFT JOIN "Location" l ON p."locationId" = l.id
                        JOIN "_TenantFavorites" tf ON p.id = tf."A"
                        WHERE tf."B" = t.id
                    ),
                    '[]'
                ) as favorites
            FROM "Tenant" t
            WHERE t."authId" = ${authId}
        `;
        
        const tenant = query[0];

        if (tenant) {
            return res.status(200).json(tenant);
        } else {
            return res.status(404).json({ message: "Tenant not found" });
        }
    } catch (error: any) {
        return res.status(500).json({ message: `Error retrieving tenant: ${error.message}` });
    }
})

export const createTenant = AsyncHandler(async(req:Request,res:Response)=>{
    const {name,email,phone,authId} = req.body;
    const [tenant] = await sql`INSERT INTO "Tenant" (name,email,phone,authId) VALUES (${name},${email},${phone},${authId})`;
    return res.status(201).json({"message":"tenant created successfully",tenant});
})


export const updateTenant = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const authId = req.user?.id;
    const {name,email,phoneNumber} = req.body;
    if(!name || !email || !phoneNumber) throw new ApiError(400,"All fields are required");
    const UpdatedTenant = await sql`UPDATE "Tenant" SET name = ${name}, email = ${email}, "phoneNumber" = ${phoneNumber} WHERE "authId" = ${authId}`;
    if(!UpdatedTenant) throw new ApiError(404,"Tenant not found");
    return res.status(200).json({"message":"tenant updated successfully",UpdatedTenant});
})


export const getCurrResidence = AsyncHandler(async(req:Request,res:Response)=>{
    const {authId} = req.params;
    const residences = await sql`
        SELECT 
            p.*,
            json_build_object(
                'id', l.id,
                'address', l.address,
                'city', l.city,
                'state', l.state,
                'country', l.country,
                'postalCode', l."postalCode",
                'coordinates', json_build_object(
                    'longitude', ST_X(l.coordinates::geometry),
                    'latitude', ST_Y(l.coordinates::geometry)
                )
            ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
        JOIN "_TenantProperties" tp ON p.id = tp."A"
        JOIN "Tenant" t ON tp."B" = t.id
        WHERE t."authId" = ${authId}
    `;
    return res.status(200).json(residences);
})


export const ToggleFavourite = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const authId = req.user?.id; 
    if(!authId) throw new ApiError(401, "Not Authenticated");
    const { propertyId } = req.params;
    
    // 1. Get the tenant integer ID from authId
    const [tenant] = await sql`SELECT id FROM "Tenant" WHERE "authId" = ${authId}`;
    if (!tenant) throw new ApiError(404, "Tenant not found");

    const tenantId = tenant.id;
    const propId = Number(propertyId);

    // 2. Check if the favorite relationship already exists
    const [existing] = await sql`
        SELECT 1 FROM "_TenantFavorites" 
        WHERE "A" = ${propId} AND "B" = ${tenantId}
    `;

    if (existing) {
        // 3. If exists, remove it
        await sql`
            DELETE FROM "_TenantFavorites" 
            WHERE "A" = ${propId} AND "B" = ${tenantId}
        `;
        return res.status(200).json({ message: "Property removed from favorites", isFavorite: false });
    } else {
        // 4. If doesn't exist, add it
        await sql`
            INSERT INTO "_TenantFavorites" ("A", "B") 
            VALUES (${propId}, ${tenantId})
        `;
        return res.status(200).json({ message: "Property added to favorites", isFavorite: true });
    }
})

export const removeFavourite = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const authId = req.user?.id;
    if(!authId) throw new ApiError(401, "Not Authenticated");
    const {propertyId} = req.params;
    const [tenant] = await sql`SELECT id FROM "Tenant" WHERE "authId" = ${authId}`;
    if(!tenant) throw new ApiError(404, "Tenant not found");
    const tenantId = tenant.id;
    const propId = Number(propertyId);
    const [existing] = await sql`
        SELECT 1 FROM "_TenantFavorites" 
        WHERE "A" = ${propId} AND "B" = ${tenantId}
    `;
    if(!existing) throw new ApiError(404, "Property not found in favorites");
    await sql`
        DELETE FROM "_TenantFavorites" 
        WHERE "A" = ${propId} AND "B" = ${tenantId}
    `;
    return res.status(200).json({ message: "Property removed from favorites", isFavorite: false });
})
