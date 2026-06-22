"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";

const HeroSection = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          trimmedQuery
        )}&format=json&limit=1`,
        {
          headers: {
            "Accept": "application/json",
          }
        }
      );
      const data = await response.json();
      console.log("response from openstreetMap is ",data);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const longitude = parseFloat(lon);
        const latitude = parseFloat(lat);
        dispatch(
          setFilters({
            location: trimmedQuery,
            coordinates: [longitude, latitude],
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: latitude.toString(),
          lng: longitude.toString(),
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };

  return (
    <div className="relative  h-screen">
      <Image
        src="/realEstate.jpg"
        alt="PrimeReside Rental Platform Hero Section"
        fill
        className="object-cover z-0 absolute top-0 object-center"
        loading='lazy'
        fetchPriority="low"
      />
      <div className="absolute text-white  flex flex-col justify-center items-center w-full h-full inset-0  bg-black opacity-60"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute top-2/4 transform -translate-y-1/2 w-full text-center"
      >
        <div className="max-w-5xl mx-auto px-16 sm:px-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-linear-to-r text-transparent bg-clip-text from-red-500 to-pink-400">Live Prime.</span> Choose Right.
            <br /> One Platform for Every Property Need
          </h1>
          <p className="text-xl text-white mb-8">
            Discover and rent properties with PrimeReside.
          </p>

          <div className="flex justify-center">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, neighborhood or address"
              className="w-full max-w-lg placeholder:text-black rounded-none rounded-l-xl border-none active:backdrop-blur-none backdrop-blur-2xl ring-1 ring-amber-300 h-12"
            />
            <Button
              onClick={handleLocationSearch}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="bg-secondary-500 border-none ring ring-amber-200 bg-orange-500/80 rounded-none rounded-r-xl shadow-md cursor-pointer hover:shadow-amber-400 h-12"
            >
              Search
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
