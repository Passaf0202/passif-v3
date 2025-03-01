
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Globe, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type Region = {
  name: string;
  countries: Country[];
  expanded: boolean;
}

type Country = {
  name: string;
  code: string;
}

const regions: Region[] = [
  {
    name: "Amérique du Nord",
    expanded: false,
    countries: [
      { name: "États-Unis", code: "US" },
      { name: "Canada", code: "CA" },
      { name: "Mexique", code: "MX" }
    ]
  },
  {
    name: "Amérique Latine",
    expanded: false,
    countries: [
      { name: "Brésil", code: "BR" },
      { name: "Argentine", code: "AR" },
      { name: "Colombie", code: "CO" },
      { name: "Chili", code: "CL" },
      { name: "Pérou", code: "PE" }
    ]
  },
  {
    name: "Europe",
    expanded: false,
    countries: [
      { name: "France", code: "FR" },
      { name: "Allemagne", code: "DE" },
      { name: "Royaume-Uni", code: "GB" },
      { name: "Italie", code: "IT" },
      { name: "Espagne", code: "ES" },
      { name: "Portugal", code: "PT" },
      { name: "Belgique", code: "BE" },
      { name: "Pays-Bas", code: "NL" },
      { name: "Suisse", code: "CH" },
      { name: "Autriche", code: "AT" },
      { name: "Suède", code: "SE" },
      { name: "Norvège", code: "NO" },
      { name: "Danemark", code: "DK" },
      { name: "Finlande", code: "FI" },
      { name: "Irlande", code: "IE" },
      { name: "Pologne", code: "PL" },
      { name: "République Tchèque", code: "CZ" },
      { name: "Hongrie", code: "HU" },
      { name: "Roumanie", code: "RO" },
      { name: "Grèce", code: "GR" },
      { name: "Ukraine", code: "UA" },
      { name: "Croatie", code: "HR" },
      { name: "Bulgarie", code: "BG" },
      { name: "Slovaquie", code: "SK" },
      { name: "Slovénie", code: "SI" },
      { name: "Estonie", code: "EE" },
      { name: "Lettonie", code: "LV" },
      { name: "Lituanie", code: "LT" },
      { name: "Serbie", code: "RS" }
    ]
  },
  {
    name: "Océanie",
    expanded: false,
    countries: [
      { name: "Australie", code: "AU" },
      { name: "Nouvelle-Zélande", code: "NZ" }
    ]
  },
  {
    name: "Afrique",
    expanded: false,
    countries: [
      { name: "Afrique du Sud", code: "ZA" },
      { name: "Maroc", code: "MA" },
      { name: "Égypte", code: "EG" },
      { name: "Nigeria", code: "NG" },
      { name: "Kenya", code: "KE" }
    ]
  },
  {
    name: "Moyen-Orient",
    expanded: false,
    countries: [
      { name: "Émirats Arabes Unis", code: "AE" },
      { name: "Arabie Saoudite", code: "SA" },
      { name: "Qatar", code: "QA" },
      { name: "Israël", code: "IL" },
      { name: "Turquie", code: "TR" }
    ]
  },
  {
    name: "Asie",
    expanded: false,
    countries: [
      { name: "Japon", code: "JP" },
      { name: "Corée du Sud", code: "KR" },
      { name: "Singapour", code: "SG" },
      { name: "Malaisie", code: "MY" },
      { name: "Indonésie", code: "ID" },
      { name: "Thaïlande", code: "TH" },
      { name: "Vietnam", code: "VN" },
      { name: "Philippines", code: "PH" },
      { name: "Inde", code: "IN" },
      { name: "Taiwan", code: "TW" },
      { name: "Hong Kong", code: "HK" }
    ]
  }
];

const CountryFlag = ({ code }: { code: string }) => {
  return (
    <span className="inline-block w-6 h-4 mr-2 align-middle overflow-hidden rounded-sm border border-gray-200 shadow-sm">
      <img 
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} 
        alt={`Drapeau ${code}`}
        className="w-full h-full object-cover"
      />
    </span>
  );
};

export function GlobalPresenceSection() {
  const isMobile = useIsMobile();
  const [expandedRegions, setExpandedRegions] = useState<{ [key: string]: boolean }>({});
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };
  
  // Number of countries to show initially
  const initialCountriesToShow = 5;
  
  // Number of regions to display per view in desktop
  const regionsPerView = 3;
  
  // For desktop horizontal scrolling
  const handleScrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - 1));
  };
  
  const handleScrollRight = () => {
    setScrollPosition(Math.min(Math.ceil(regions.length / regionsPerView) - 1, scrollPosition + 1));
  };
  
  // Get visible regions based on scroll position
  const getVisibleRegions = () => {
    const start = scrollPosition * regionsPerView;
    const end = Math.min(start + regionsPerView, regions.length);
    return regions.slice(start, end);
  };
  
  return (
    <section className="py-16 relative overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="md:w-1/3 mb-8 md:mb-0 pr-0 md:pr-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
              Leader mondial des transactions crypto P2P
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Depuis notre création, nous nous sommes développés dans plus de 80 pays et continuons notre expansion. Les pays listés indiquent où vous pouvez utiliser Tradecoiner.
            </p>
            
            <p className="text-lg text-gray-600 mb-6">
              Notre plateforme s'appuie sur des technologies blockchain sécurisées, des systèmes KYC avancés et notre réseau mondial d'utilisateurs vérifiés.
            </p>
            
            <div className="flex items-center mt-8">
              <div className="bg-gray-100 rounded-full p-3 mr-4">
                <Globe size={24} className="text-gray-700" />
              </div>
              <p className="font-medium text-lg">80+ pays</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            {isMobile ? (
              <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {regions.map((region) => (
                  <div key={region.name} className="flex-shrink-0 w-80 bg-gray-50 p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{region.name}</h3>
                      <button 
                        onClick={() => toggleRegion(region.name)}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        {expandedRegions[region.name] ? (
                          <ChevronUp size={20} className="text-gray-700" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-700" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-y-3">
                      {region.countries
                        .slice(0, expandedRegions[region.name] ? undefined : Math.min(initialCountriesToShow, region.countries.length))
                        .map((country) => (
                          <div key={country.code} className="flex items-center">
                            <CountryFlag code={country.code} />
                            <span className="text-sm">{country.name}</span>
                          </div>
                        ))}
                      
                      {!expandedRegions[region.name] && region.countries.length > initialCountriesToShow && (
                        <div className="flex items-center justify-center mt-2">
                          <button 
                            onClick={() => toggleRegion(region.name)}
                            className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700"
                          >
                            Voir plus ({region.countries.length - initialCountriesToShow})
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative">
                {scrollPosition > 0 && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md"
                    onClick={handleScrollLeft}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                )}
                
                {scrollPosition < Math.ceil(regions.length / regionsPerView) - 1 && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md"
                    onClick={handleScrollRight}
                  >
                    <ChevronRight size={20} />
                  </Button>
                )}
                
                <div className="grid grid-cols-3 gap-6 pb-4">
                  {getVisibleRegions().map((region) => (
                    <Card key={region.name} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-gray-900">{region.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Afficher tous les pays
                            </span>
                            <Checkbox 
                              id={`expand-${region.name}`} 
                              checked={expandedRegions[region.name]} 
                              onCheckedChange={() => toggleRegion(region.name)}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4">
                        <ScrollArea className="max-h-72">
                          <div className="flex flex-wrap gap-3">
                            {region.countries
                              .slice(0, expandedRegions[region.name] ? undefined : Math.min(initialCountriesToShow, region.countries.length))
                              .map((country) => (
                                <div 
                                  key={country.code}
                                  className="flex items-center bg-white rounded-full py-2 px-4 text-sm font-medium text-gray-700 border border-gray-200"
                                >
                                  <CountryFlag code={country.code} />
                                  {country.name}
                                </div>
                              ))}
                            
                            {!expandedRegions[region.name] && region.countries.length > initialCountriesToShow && (
                              <button 
                                onClick={() => toggleRegion(region.name)}
                                className="flex items-center bg-gray-100 rounded-full py-2 px-4 text-sm font-medium text-gray-700 border border-gray-200"
                              >
                                +{region.countries.length - initialCountriesToShow} pays
                              </button>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
