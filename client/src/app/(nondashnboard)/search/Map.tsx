"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import Link from "next/link";

// Fix for Leaflet marker icons not showing up in React
// @ts-expect-error: Leaflet icon prototype manipulation is needed for React compatibility
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const Map = () => {
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  if (isLoading) return <>Loading...</>;
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  const center: [number, number] = filters.coordinates 
    ? [filters.coordinates[1], filters.coordinates[0]] // Leaflet uses [lat, lng]
    : [40.7128, -74.0060]; // Default to NY

  return (
    <div className="basis-5/12 grow relative rounded-xl overflow-hidden min-h-[500px]">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
          property.location && (
            <Marker
              key={property.id}
              position={[
                property.location.coordinates.latitude,
                property.location.coordinates.longitude,
              ]}
            >
              <Popup>
                <div className="flex justify-between items-center gap-3 bg-pink-400/80 text-white p-2 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <Link 
                      href={`/search/${property.id}`} 
                      className="font-bold text-primary hover:underline"
                    >
                      {property.name}
                    </Link>
                    <p className="text-sm font-semibold">
                      ${property.pricePerMonth}
                      <span className="text-gray-500 font-normal text-xs"> / month</span>
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
