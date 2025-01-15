import { useEffect, useState } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "./ui/alert";
import { InfoIcon } from "lucide-react";

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

interface CategoryAttribute {
  attribute_type: string;
  attribute_value: string;
}

export function ProductDetails({ category, subcategory, onDetailsChange }: ProductDetailsProps) {
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([]);
  const [popularCarBrands, setPopularCarBrands] = useState<string[]>([]);
  const [carBrands, setCarBrands] = useState<string[]>([]);
  const [motorcycleBrands, setMotorcycleBrands] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      fetchCategoryAttributes();
    }
  }, [category]);

  const fetchCategoryAttributes = async () => {
    try {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category)
        .single();

      if (categoryData) {
        const { data: attributesData } = await supabase
          .from("category_attributes")
          .select("*")
          .eq("category_id", categoryData.id);

        if (attributesData) {
          setAttributes(attributesData);
          
          // Organiser les marques
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
      console.error("Error fetching category attributes:", error);
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

  const renderBrandSelect = () => {
    let brands = [];
    if (isCarCategory) {
      // Grouper les marques populaires en premier
      brands = [
        { label: "Marques populaires", options: popularCarBrands },
        { label: "Toutes les marques", options: carBrands }
      ];
    } else if (isMotorcycleCategory) {
      brands = [{ label: "Marques", options: motorcycleBrands }];
    }

    return (
      <FormItem>
        <FormLabel>Marque</FormLabel>
        <Select onValueChange={(value) => handleChange("brand", value)}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une marque" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {brands.map((group) => (
              <div key={group.label}>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                  {group.label}
                </div>
                {group.options.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <div className="space-y-4">
      {isVehicle && (
        <>
          {renderBrandSelect()}

          <FormItem>
            <FormLabel>Modèle</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Golf VII"
                onChange={(e) => handleChange("model", e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Année du modèle</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="Ex: 2018"
                onChange={(e) => handleChange("year", parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Plaque d'immatriculation</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: AB-123-CD"
                onChange={(e) => handleChange("registration", e.target.value)}
              />
            </FormControl>
            <FormMessage />
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                La plaque d'immatriculation est uniquement conservée par nos services et ne sera pas visible sur l'annonce
              </AlertDescription>
            </Alert>
          </FormItem>

          <FormItem>
            <FormLabel>Date de première mise en circulation</FormLabel>
            <FormControl>
              <Input 
                type="date"
                onChange={(e) => handleChange("firstRegistrationDate", e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Date de fin de validité du contrôle technique</FormLabel>
            <FormControl>
              <Input 
                type="date"
                onChange={(e) => handleChange("technicalInspectionDate", e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Kilométrage</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="En kilomètres"
                onChange={(e) => handleChange("mileage", parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {isCarCategory && (
            <>
              <FormItem>
                <FormLabel>Type de carburant</FormLabel>
                <Select onValueChange={(value) => handleChange("fuelType", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de carburant" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("fuel_type").map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Boîte de vitesse</FormLabel>
                <Select onValueChange={(value) => handleChange("transmission", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de boîte" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("transmission_type").map((transmission) => (
                      <SelectItem key={transmission} value={transmission}>
                        {transmission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Type de véhicule</FormLabel>
                <Select onValueChange={(value) => handleChange("vehicleType", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de véhicule" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("vehicle_type").map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Nombre de portes</FormLabel>
                <Select onValueChange={(value) => handleChange("doors", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le nombre de portes" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("doors").map((doors) => (
                      <SelectItem key={doors} value={doors}>
                        {doors}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </>
          )}

          <FormItem>
            <FormLabel>Puissance fiscale</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="En CV"
                onChange={(e) => handleChange("fiscalPower", parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Puissance DIN</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="En ch"
                onChange={(e) => handleChange("enginePower", parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {isMotorcycleCategory && (
            <FormItem>
              <FormLabel>Type de permis</FormLabel>
              <Select onValueChange={(value) => handleChange("licenseType", value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de permis" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="with_license">Avec permis</SelectItem>
                  <SelectItem value="without_license">Sans permis</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}

          {isCarCategory && (
            <>
              <FormItem>
                <FormLabel>Sellerie</FormLabel>
                <Select onValueChange={(value) => handleChange("upholstery", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type de sellerie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("upholstery").map((upholstery) => (
                      <SelectItem key={upholstery} value={upholstery}>
                        {upholstery}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Couleur</FormLabel>
                <Select onValueChange={(value) => handleChange("color", [value])}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la couleur" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("color").map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Caractéristiques</FormLabel>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="maintenance_book"
                      onCheckedChange={(checked) => {
                        const characteristics = checked 
                          ? ["Carnet d'entretien disponible"]
                          : [];
                        handleChange("characteristics", characteristics);
                      }}
                    />
                    <label htmlFor="maintenance_book">Carnet d'entretien disponible</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="non_smoker"
                      onCheckedChange={(checked) => {
                        const characteristics = checked 
                          ? ["Véhicule non fumeur"]
                          : [];
                        handleChange("characteristics", characteristics);
                      }}
                    />
                    <label htmlFor="non_smoker">Véhicule non fumeur</label>
                  </div>
                </div>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>État du véhicule</FormLabel>
                <Select onValueChange={(value) => handleChange("vehicleCondition", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'état du véhicule" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="non_damaged">Non endommagé</SelectItem>
                    <SelectItem value="damaged">Endommagé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Vignette Crit'Air</FormLabel>
                <Select onValueChange={(value) => handleChange("critAir", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la vignette Crit'Air" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("crit_air").map((crit) => (
                      <SelectItem key={crit} value={crit}>
                        {crit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>

              <FormItem>
                <FormLabel>Classe d'émission</FormLabel>
                <Select onValueChange={(value) => handleChange("emissionClass", value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la classe d'émission" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAttributeValues("emission_class").map((emission) => (
                      <SelectItem key={emission} value={emission}>
                        {emission}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </>
          )}
        </>
      )}
    </div>
  );
}