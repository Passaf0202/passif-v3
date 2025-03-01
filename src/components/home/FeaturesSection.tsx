
import { Card, CardContent } from "@/components/ui/card";
import { DiamondViewer } from "@/components/home/DiamondViewer";

export function FeaturesSection() {
  const features = [
    {
      title: "Sécurisez vos transactions",
      description: "Vérifiez l'identité des vendeurs et évitez les arnaques avec notre système KYC."
    },
    {
      title: "Paiement instantané",
      description: "Payez directement depuis votre wallet en quelques secondes."
    },
    {
      title: "Économisez sur les frais",
      description: "Transactions à faible coût pour l'acheteur, gratuites pour le vendeur."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Échangez intelligemment
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme sécurisée pour vos transactions crypto
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col items-center">
                  <div className="w-full h-48 bg-blue-50 flex items-center justify-center p-4">
                    <div className="w-full h-full relative">
                      <DiamondViewer 
                        state={index === 0 ? "awaiting-confirmation" : index === 1 ? "wallet-connect" : "confirmed"} 
                        scale={2.8}
                      />
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
