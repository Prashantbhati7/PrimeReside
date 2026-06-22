import AsyncHandler from "../utils/asyncHandler.js";
import { sql } from "../lib/db.js";
import ApiError from "../utils/ApiError.js";

export const getManagerById = AsyncHandler(async (req, res) => {
  const { authId } = req.params;
  const [manager] =
    await sql`SELECT * FROM "Manager" WHERE "authId" = ${authId}`;
  if (!manager) {
    throw new ApiError(404, "Manager not found");
  }
  return res.status(200).json({ message: "Manager found", manager });
});

export const updatemanager = AsyncHandler(async (req, res) => {
  const authId = req.user?.id;
  if (!authId) {
    throw new ApiError(401, "Unauthorized");
  }
  const { name, email, phoneNumber } = req.body;
  if (!name || !email || !phoneNumber) {
    throw new ApiError(400, "All fields are required");
  }
  const updatedManager =
    await sql`UPDATE "Manager" SET name = ${name}, email = ${email}, "phoneNumber" = ${phoneNumber} WHERE "authId" = ${authId}`;
  if (!updatedManager) {
    throw new ApiError(404, "Manager not found");
  }
  return res
    .status(200)
    .json({ message: "Manager updated successfully", updatedManager });
});

export const createManager = AsyncHandler(async (req, res) => {
  const { name, email, phoneNumber, authId } = req.body;
  if (!name || !email || !phoneNumber || !authId) {
    throw new ApiError(400, "All fields are required");
  }
  const [manager] =
    await sql`INSERT INTO "Manager" (name,email,"phoneNumber","authId") VALUES (${name},${email},${phoneNumber},${authId})`;
  return res
    .status(201)
    .json({ message: "Manager created successfully", manager });
});

export const getManagerProperties = AsyncHandler(async (req, res) => {
  const { authId } = req.params;
  const properties = await sql`
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
        WHERE p."managerAuthId" = ${authId}
    `;
  return res.status(200).json(properties);
});
