import { Request, Response } from "express";
import AsyncHandler from "../utils/asyncHandler.js";
import { sql } from "../lib/db.js";
import ApiError from "../utils/ApiError.js";
import axios from "axios";

import {v2 as cloudinary} from 'cloudinary';
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



export const getProperties = async (req: Request, res: Response) => {
    console.log("request recieved at get properties");
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];

    // 🟢 Favorites
    if (favoriteIds) {
      const ids = (favoriteIds as string).split(",").map(Number);
      params.push(ids);
      conditions.push(`p.id = ANY($${params.length})`);
    }
    
    // 🟢 Price
    if (priceMin) {
      params.push(Number(priceMin));
      conditions.push(`p."pricePerMonth" >= $${params.length}`);
    }
    
    if (priceMax) {
      params.push(Number(priceMax));
      conditions.push(`p."pricePerMonth" <= $${params.length}`);
    }

    // 🟢 Beds / Baths
    if (beds && beds !== "any") {
      params.push(Number(beds));
      conditions.push(`p.beds >= $${params.length}`);
    }

    if (baths && baths !== "any") {
      params.push(Number(baths));
      conditions.push(`p.baths >= $${params.length}`);
    }

    // 🟢 Area
    if (squareFeetMin) {
      params.push(Number(squareFeetMin));
      conditions.push(`p."squareFeet" >= $${params.length}`);
    }

    if (squareFeetMax) {
      params.push(Number(squareFeetMax));
      conditions.push(`p."squareFeet" <= $${params.length}`);
    }

    // 🟢 Property Type
    if (propertyType && propertyType !== "any") {
      params.push(propertyType);
      conditions.push(`p."propertyType" = $${params.length}`);
    }

    // 🟢 Amenities (Postgres array contains)
    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      params.push(amenitiesArray);
      conditions.push(`p.amenities @> $${params.length}`);
    }

    // 🟢 Available From
    if (availableFrom && availableFrom !== "any") {
      const date = new Date(availableFrom as string);
      if (!isNaN(date.getTime())) {
        params.push(date.toISOString());
        conditions.push(`
          EXISTS (
            SELECT 1 FROM "Lease" l2
            WHERE l2."propertyId" = p.id
            AND l2."startDate" <= $${params.length}
          )
        `);
      }
    }

    // 🟢 Location (PostGIS)
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = 1000;
      const degrees = radiusKm / 111;

      params.push(lng, lat, degrees);
      conditions.push(`
        ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint($${params.length - 2}, $${params.length - 1}), 4326),
          $${params.length}
        )
      `);
    }

    // 🟡 Build WHERE clause safely
    let whereClause = "";
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(" AND ")}`;
    }
    console.log(conditions);
    console.log(whereClause);
    // 🟢 Final Query
    const queryText = `
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
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereClause}
    `;
    const properties = await sql.query(queryText, params);
    console.log(properties);
    return res.status(200).json({"message":"properties fetched successfully",properties})
};

export const getPropertyById = AsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const queryText = `
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
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      WHERE p.id = $1
    `;

    const property = await sql.query(queryText, [Number(id)]);

    if (!property || property.length === 0) {
        throw new ApiError(404, "Property not found");
    }

    return res.status(200).json({"message":"property fetched successfully",property});
});

export const createProperty = AsyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerAuthId,
      ...propertyData
    } = req.body;

    // 🟢 Upload photos
    const photoUrls = await Promise.all(
      files.map(async (file) => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: process.env.CLOUDINARY_FOLDER || "prime-reside",
            },
            (error, result) => {
              if (error) return reject(error);
              if (result) resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      })
    );

    // 🟢 Geocode address
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
      },
    });
    console.log("on creating property, geocoding res for address", address, geocodingResponse.data);
    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
        : [0, 0];

    // 🟢 Create Location securely
    const insertLocationQuery = `
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;
    const locationParams = [address, city, state, country, postalCode, longitude, latitude];
    const locationResult = await sql.query(insertLocationQuery, locationParams);
    const locationId = locationResult[0].id;

    // 🟢 Create Property securely
    const amenities = typeof propertyData.amenities === "string" ? propertyData.amenities.split(",") : [];
    const highlights = typeof propertyData.highlights === "string" ? propertyData.highlights.split(",") : [];
    
    const insertPropertyQuery = `
      INSERT INTO "Property" (
        "name", "description", "pricePerMonth", "securityDeposit", 
        "applicationFee", "photoUrls", "amenities", "highlights", 
        "isPetsAllowed", "isParkingIncluded", "beds", "baths", 
        "squareFeet", "propertyType", "locationId", "managerAuthId"
      ) VALUES (
        $1, $2, $3, $4, 
        $5, $6, $7, $8, 
        $9, $10, $11, $12, 
        $13, $14, $15, $16
      )
      RETURNING *
    `;
    const propertyParams = [
        propertyData.name,
        propertyData.description,
        parseFloat(propertyData.pricePerMonth),
        parseFloat(propertyData.securityDeposit),
        parseFloat(propertyData.applicationFee),
        photoUrls,
        amenities,
        highlights,
        propertyData.isPetsAllowed === "true",
        propertyData.isParkingIncluded === "true",
        parseInt(propertyData.beds),
        parseFloat(propertyData.baths),
        parseInt(propertyData.squareFeet),
        propertyData.propertyType,
        locationId,
        managerAuthId
    ];
    
    const propertyResult = await sql.query(insertPropertyQuery, propertyParams);
    
    return res.status(201).json({
      ...propertyResult[0],
      location: locationResult[0]
    });
});


export const getPropertyLeases = AsyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    const {id} = req.params;
    const authId = req.user?.id;
    const managerAuthId = await sql`SELECT "managerAuthId" FROM "Property" WHERE "id" = ${id}`;
    if(managerAuthId[0].managerAuthId !== authId){
        throw new ApiError(403,"You are not authorized to access this property");
    }
    const leases = await sql`SELECT * FROM "Lease" LEFT JOIN "Tenant" ON "Lease"."tenantAuthId" = "Tenant"."authId" WHERE "propertyId" = ${id}`;
    return res.status(200).json({"message":"leases fetched successfully",leases});
})
