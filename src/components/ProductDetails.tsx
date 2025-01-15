import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VehicleBrandSelect } from "./vehicle-details/VehicleBrandSelect";
import { BasicVehicleInfo } from "./vehicle-details/BasicVehicleInfo";
import { CarSpecificDetails } from "./vehicle-details/CarSpecificDetails";

interface CategoryAttribute {
  attribute_type: string;
  attribute_value: string;
}

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
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [popularCarBrands, setPopularCarBrands] = useState<string[]>([]);
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      console.log("Fetching attributes for category:", category);
      fetchCategoryAttributes();
    }
  }, [category]);

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
          
          const popular = attributesData
            .filter(attr => attr.attribute_type === 'popular_car_brand')
            .map(attr => attr.attribute_value);
          setPopularCarBrands(popular);

          const cars = attributesData
            .filter(attr => attr.attribute_type === 'car_brand')
            .map(attr => attr.attribute_value);
          setCarBrands(cars);

          const motorcycles = attributesData
            .filter(attr => attr.attribute_type === 'motorcycle_brand')
            .map(attr => attr.attribute_value);
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

  const isVehicle = category === "Voitures" || category === "Motos";
  const isCarCategory = category === "Voitures";
  const isMotorcycleCategory = category === "Motos";

  const getAttributeValues = (type: string) => {
    return attributes
      .filter(attr => attr.attribute_type === type)
      .map(attr => attr.attribute_value);
  };

  return (
    <div className="space-y-4">
      {isVehicle && (
        <>
          <VehicleBrandSelect
            isCarCategory={isCarCategory}
            popularCarBrands={popularCarBrands}
            carBrands={carBrands}
            motorcycleBrands={motorcycleBrands}
            onBrandChange={(value) => handleChange("brand", value)}
          />

          <BasicVehicleInfo onDetailsChange={handleChange} />

          {isCarCategory && (
            <CarSpecificDetails
              getAttributeValues={getAttributeValues}
              onDetailsChange={handleChange}
            />
          )}
        </>
      )}
    </div>
  );
}