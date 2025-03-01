
import { Shield, Zap, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      color: "#0EA5E9", // Ocean Blue
      title: "Sécurisez vos transactions",
      description: "Vérifiez l'identité des vendeurs grâce à notre système KYC et achetez en toute confiance. Chaque vendeur est validé pour éviter les fraudes."
    },
    {
      icon: Zap,
      color: "#22C55E", // Green
      title: "Paiement instantané en crypto",
      description: "Grâce à WalletConnect, payez directement depuis votre wallet et finalisez votre transaction en quelques secondes, sans intermédiaire."
    },
    {
      icon: DollarSign,
      color: "#F97316", // Bright Orange
      title: "Moins de frais, plus d'avantages",
      description: "L'acheteur paie uniquement de faibles frais de commission pour un paiement sécurisé, tandis que le vendeur ne paie aucun frais."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Achetez et vendez intelligemment
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Avec Tradecoiner, profitez d'une plateforme sécurisée et optimisée pour vos transactions crypto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 flex items-center justify-center rounded-full mb-6"
                    style={{ backgroundColor: `${feature.color}10` }}
                  >
                    <feature.icon 
                      size={30} 
                      className="text-center" 
                      style={{ color: feature.color }} 
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
