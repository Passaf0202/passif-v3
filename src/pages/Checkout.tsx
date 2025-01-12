import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, MapPin, Home, Shield } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { listing } = location.state || {};
  const [shippingMethod, setShippingMethod] = useState("relay");

  if (!listing) {
    navigate("/");
    return null;
  }

  const buyerProtectionFee = Math.round(listing.price * 0.15 * 100) / 100;
  const shippingFee = shippingMethod === "relay" ? 2.88 : 4.38;
  const total = listing.price + buyerProtectionFee + shippingFee;

  return (
    <div className="container max-w-5xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.description}</p>
                  <p className="font-bold mt-2">{listing.price} €</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Adresse</CardTitle>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Pierre Assaf</p>
                  <p className="text-gray-600">26 rue virginia, Batiment D</p>
                  <p className="text-gray-600">33200, Bordeaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options de livraison</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                defaultValue="relay"
                onValueChange={setShippingMethod}
                className="space-y-4"
              >
                <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="relay" id="relay" />
                    <Label htmlFor="relay" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Envoi au point relais</p>
                        <p className="text-sm text-gray-500">
                          À partir de 2,88 €
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>

                <div className="flex items-center justify-between space-x-2 border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="home" id="home" />
                    <Label htmlFor="home" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Envoi à domicile</p>
                        <p className="text-sm text-gray-500">
                          À partir de 4,38 €
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Commande</span>
                  <span>{listing.price} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span>Frais de Protection acheteurs</span>
                    <Collapsible>
                      <CollapsibleTrigger className="text-gray-500">
                        ℹ️
                      </CollapsibleTrigger>
                      <CollapsibleContent className="bg-gray-50 p-2 rounded mt-1 text-sm">
                        Ces frais nous permettent de vous protéger lors de vos
                        achats
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                  <span>{buyerProtectionFee} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de port</span>
                  <span>{shippingFee} €</span>
                </div>
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{total} €</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">Payer</Button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Ce paiement est crypté et sécurisé</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}