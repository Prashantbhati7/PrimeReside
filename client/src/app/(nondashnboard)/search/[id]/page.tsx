"use client";

import { useGetApplicationByPropertyIdQuery, useGetAuthUserQuery, useGetPropertyQuery } from "@/state/api";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ImagePreviews from "./ImagePreviews";
import PropertyOverview from "./PropertyOverview";
import PropertyDetails from "./PropertyDetails";
import PropertyLocation from "./PropertyLocation";
import ContactWidget from "./ContactWidget";
import ApplicationModal from "./ApplicationModal";
import Loading from "@/components/Loading";

const SingleListing = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: authUser } = useGetAuthUserQuery();
  const {data: property,isError,isLoading} = useGetPropertyQuery(propertyId);
  console.log("property is ",property);
  const {data: application,isError:appError,isLoading:appLoading} = useGetApplicationByPropertyIdQuery(propertyId);
  console.log("application is ",application);
  if (isLoading) return <div className="h-full w-full flex items-center justify-center"> <Loading/> </div>
  if (isError) return <div>Error loading property</div>;
  return (
    <div>
      <ImagePreviews
        images={property?.photoUrls || []}
      />
      <div className="flex flex-col md:flex-row justify-center gap-10 mx-10 md:w-2/3 md:mx-auto mt-16 mb-8">
        <div className="order-2 md:order-1">
          <PropertyOverview propertyId={propertyId} />
          <PropertyDetails propertyId={propertyId} />
          <PropertyLocation propertyId={propertyId} />
        </div>

    { appLoading? <div className="order w-10 h-10 flex items-center justify-center  md:order-2"> <Loading/></div> :  <div className="order  md:order-2">
          <ContactWidget applied={application?.length} onOpenModal={() => setIsModalOpen(true)} />
        </div>}
      </div>

      {authUser && (
        <ApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          propertyId={propertyId}
        />
      )}
    </div>
  );
};

export default SingleListing;
