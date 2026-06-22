import { sql } from "../lib/db.js";
import AsyncHandler from "../utils/asyncHandler.js";

export const getLease = AsyncHandler(async (req, res) => {
  const leases = await sql`
        SELECT 
            l.*,
            json_build_object(
                'id', t.id,
                'name', t.name,
                'email', t.email,
                'authId', t."authId",
                'phoneNumber', t."phoneNumber"
            ) as tenant,
            json_build_object(
                'id', p.id,
                'name', p.name,
                'photoUrls', p."photoUrls",
                'pricePerMonth', p."pricePerMonth"
            ) as property
        FROM "Lease" l
        JOIN "Tenant" t ON l."tenantAuthId" = t."authId"
        JOIN "Property" p ON l."propertyId" = p.id
    `;
  return res.status(200).json(leases);
});

export const getLeasePayment = AsyncHandler(async (req, res) => {
  const leaseId = req.params.id;
  const payments = await sql`SELECT * FROM "Payment" WHERE "leaseId" = ${leaseId}`;
  return res.status(200).json(payments);
});
