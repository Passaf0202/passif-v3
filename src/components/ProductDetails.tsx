import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleBrandSelect } from "./vehicle-details/VehicleBrandSelect";
import { BasicVehicleInfo } from "./vehicle-details/BasicVehicleInfo";
import { CarSpecificDetails } from "./vehicle-details/CarSpecificDetails";
import { Card, CardContent } from "./ui/card";

interface ProductDetailsProps {
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  onDetailsChange: (details: {
    brand?: string;
    condition?: string;
    color?: string[];
    material?: string[];
    model?: string;
    year?: number;
    registration?: string;
    firstRegistrationDate?: string;
    technicalInspectionDate?: string;
    fuelType?: string;
    transmission?: string;
    vehicleType?: string;
    doors?: string;
    fiscalPower?: number;
    enginePower?: number;
    licenseType?: string;
    mileage?: number;
    upholstery?: string;
    equipment?: string[];
    characteristics?: string[];
    vehicleCondition?: string;
    critAir?: string;
    emissionClass?: string;
  }) => void;
}

export function ProductDetails({ category, subcategory, onDetailsChange }: ProductDetailsProps) {
  const [attributes, setAttributes] = useState<any[]>([]);
  const [popularCarBrands, setPopularCarBrands] = useState<string[]>([]);
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      console.log("Fetching attributes for category:", category);
      fetchCategoryAttributes();
    }
  }, [category, subcategory]); // Ajout de subcategory comme dépendance

  const fetchCategoryAttributes = async () => {
    try {
      console.log("Starting to fetch category attributes");
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .single();

      if (categoryData) {
        console.log("Found category:", categoryData);
        const { data: attributesData, error } = await supabase
          .from("category_attributes")
          .select("*")
          .eq("category_id", categoryData.id);

        if (error) {
          console.error("Error fetching attributes:", error);
          return;
        }

        if (attributesData) {
          console.log("Fetched attributes:", attributesData);
          setAttributes(attributesData);

          // Filtrer les marques populaires de voitures
          const popular = attributesData
            .filter(attr => attr.attribute_type === 'popular_car_brand')
            .map(attr => attr.attribute_value);
          console.log("Popular car brands:", popular);
          setPopularCarBrands(popular);

          // Filtrer toutes les marques de voitures
          const cars = attributesData
            .filter(attr => attr.attribute_type === 'car_brand')
            .map(attr => attr.attribute_value);
          console.log("All car brands:", cars);
          setCarBrands(cars);

          // Filtrer les marques de motos
          const motorcycles = attributesData
            .filter(attr => attr.attribute_type === 'motorcycle_brand')
            .map(attr => attr.attribute_value);
          console.log("Motorcycle brands:", motorcycles);
          setMotorcycleBrands(motorcycles);
        }
      }
    } catch (error) {
      console.error("Error in fetchCategoryAttributes:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    onDetailsChange({ [field]: value });
  };

  if (!category) return null;

  const isVehicle = category === "Véhicules";
  const isCarCategory = subcategory === "Voitures";
  const isMotorcycleCategory = subcategory === "Motos";

  const getAttributeValues = (type: string) => {
    return attributes
      .filter(attr => attr.attribute_type === type)
      .map(attr => attr.attribute_value);
  };

  if (!isVehicle) return null;

  return (
    <div className="space-y-6">
      {(isCarCategory || isMotorcycleCategory) && (
        <Card>
          <CardContent className="pt-6">
            <VehicleBrandSelect
              isCarCategory={isCarCategory}
              popularCarBrands={popularCarBrands}
              carBrands={carBrands}
              motorcycleBrands={motorcycleBrands}
              onBrandChange={(value) => handleChange("brand", value)}
            />
          </CardContent>
        </Card>
      )}

      {(isCarCategory || isMotorcycleCategory) && (
        <Card>
          <CardContent className="pt-6">
            <BasicVehicleInfo onDetailsChange={handleChange} />
          </CardContent>
        </Card>
      )}

      {isCarCategory && (
        <Card>
          <CardContent className="pt-6">
            <CarSpecificDetails
              getAttributeValues={getAttributeValues}
              onDetailsChange={handleChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}