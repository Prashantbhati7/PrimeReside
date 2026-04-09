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
  // Nested relation (full property detail)
  location?: Location;
  manager?: Manager;
  // Flat location fields returned by application queries
  address?: string;
  city?: string;
  state?: string;
  country?: string;
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
  applicationDate: string;
  createdAt: string;
  leaseId?: number;
  lease?: Lease;
  property: Property;
  tenant?: Tenant;
}

export interface CardProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
  loading?: boolean;
}

export interface CardCompactProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
  loading?: boolean;
}
