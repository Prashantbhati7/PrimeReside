import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types";
import React, { useState } from "react";

import CardCompact from "@/components/CardCompact";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import { toast } from "sonner";

const Listings = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [loading,setLoading] = useState(false);
  const { data: tenant } = useGetTenantQuery(
    authUser?.userId || "",
    {
      skip: !authUser?.userId,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);
 const response = useGetPropertiesQuery(filters);
  console.log("response is ",response);
  console.log("tenant is ",tenant);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);
  
  const handleFavoriteToggle = async (propertyId: number) => {
    try{
      setLoading(true);
      if (!authUser) {
         toast.error("Please Login first to add favorites");
      }
      console.log("tenant is ",tenant);
      const isFavorite = tenant?.favorites?.some(
        (fav: Property) => fav.id === propertyId
      );
      console.log("is favorite ",isFavorite);
      if (isFavorite) {
        await removeFavorite({
          authId: authUser.userId,
          propertyId,
        });
      } else {
        await addFavorite({
          authId: authUser.userId,
          propertyId,
        });
      } 
    }
    catch(err){
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  if (isLoading) return <Loading/>
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="w-full">
      <h3 className="text-sm px-4 font-bold">
        {properties.length}{" "}
        <span className="text-gray-700 font-normal">
          Places in {filters.location}
        </span>
      </h3>
      <div className="flex">
        <div className="p-4 w-full">
          {properties?.map((property) =>
            viewMode === "grid" ? (
              <Card
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                loading = {loading}
              />
            ) : (
              <CardCompact
                key={property.id}
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                loading={loading}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
