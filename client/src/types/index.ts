import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
export { AmenityEnum, HighlightEnum, PropertyTypeEnum };

export interface Location {
  id: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
}

export interface Property {
  id: number;
  name: string;
  description: string;
  pricePerMonth: number;
  securityDeposit: number;
  applicationFee: number;
  photoUrls: string[];
  amenities: AmenityEnum[];
  highlights: HighlightEnum[];
  isPetsAllowed: boolean;
  isParkingIncluded: boolean;
  beds: number;
  baths: number;
  squareFeet: number;
  propertyType: PropertyTypeEnum;
  locationId: number;
  managerAuthId: string;
  averageRating: number;
  numberOfReviews: number;
  location?: Location;
  manager?: Manager;
}

export interface Tenant {
  id: number;
  authId: string;
  name: string;
  email: string;
  phoneNumber: string;
  favorites?: Property[];
}

export interface Manager {
  id: number;
  authId: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Lease {
  id: number;
  propertyId: number;
  tenantAuthId: string;
  startDate: string;
  endDate: string;
  rent: number;
  property?: Property;
  tenant?: Tenant;
}

export interface Payment {
  id: number;
  leaseId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

export interface Application {
  id: number;
  propertyId: number;
  tenantAuthId: string;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
  status: "Pending" | "Approved" | "Denied";
  createdAt: string;
  property?: Property;
  tenant?: Tenant;
}

export interface CardProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
}

export interface CardCompactProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
}
