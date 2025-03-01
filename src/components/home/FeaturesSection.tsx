
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Bitcoin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
export function FeaturesSection() {
  const isMobile = useIsMobile();
  const features = [{
    title: "Sécurisez vos transactions",
    description: "Vérifiez l'identité des vendeurs et évitez les arnaques avec notre système KYC.",
    icon: Shield
  }, {
    title: "Paiement instantané",
    description: "Payez directement depuis votre wallet en quelques secondes.",
    icon: Zap
  }, {
    title: "Économisez sur les frais",
    description: "Transactions à faible coût pour l'acheteur, gratuites pour le vendeur.",
    icon: Bitcoin
  }];
  return <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Utilisez <span className="highlight-stabilo">enfin</span> vos cryptos sans pendre de risque
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">L'endroit idéal pour faire vos achats en cryptomonnaies</p>
        </div>

        {isMobile ? <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory no-scrollbar">
            {features.map((feature, index) => <div key={index} className="snap-center min-w-[280px] w-[80%] shrink-0">
                <Card className="border-0 shadow-sm overflow-hidden h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-black rounded-full p-3">
                          <feature.icon size={24} className="text-white" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-center">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>)}
          </div> : <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => <Card key={index} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="bg-black rounded-full p-2 mr-3">
                        <feature.icon size={16} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </div>
    </section>;
}
