import { useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Globe, Bitcoin, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
type Region = {
  name: string;
  countries: Country[];
  expanded: boolean;
};
type Country = {
  name: string;
  code: string;
};
const regions: Region[] = [{
  name: "Amérique du Nord",
  expanded: false,
  countries: [{
    name: "États-Unis",
    code: "US"
  }, {
    name: "Canada",
    code: "CA"
  }, {
    name: "Mexique",
    code: "MX"
  }]
}, {
  name: "Amérique Latine",
  expanded: false,
  countries: [{
    name: "Brésil",
    code: "BR"
  }, {
    name: "Argentine",
    code: "AR"
  }, {
    name: "Colombie",
    code: "CO"
  }, {
    name: "Chili",
    code: "CL"
  }, {
    name: "Pérou",
    code: "PE"
  }]
}, {
  name: "Europe",
  expanded: false,
  countries: [{
    name: "France",
    code: "FR"
  }, {
    name: "Allemagne",
    code: "DE"
  }, {
    name: "Royaume-Uni",
    code: "GB"
  }, {
    name: "Italie",
    code: "IT"
  }, {
    name: "Espagne",
    code: "ES"
  }, {
    name: "Portugal",
    code: "PT"
  }, {
    name: "Belgique",
    code: "BE"
  }, {
    name: "Pays-Bas",
    code: "NL"
  }, {
    name: "Suisse",
    code: "CH"
  }, {
    name: "Autriche",
    code: "AT"
  }, {
    name: "Suède",
    code: "SE"
  }, {
    name: "Norvège",
    code: "NO"
  }, {
    name: "Danemark",
    code: "DK"
  }, {
    name: "Finlande",
    code: "FI"
  }, {
    name: "Irlande",
    code: "IE"
  }, {
    name: "Pologne",
    code: "PL"
  }, {
    name: "République Tchèque",
    code: "CZ"
  }, {
    name: "Hongrie",
    code: "HU"
  }, {
    name: "Roumanie",
    code: "RO"
  }, {
    name: "Grèce",
    code: "GR"
  }, {
    name: "Ukraine",
    code: "UA"
  }, {
    name: "Croatie",
    code: "HR"
  }, {
    name: "Bulgarie",
    code: "BG"
  }, {
    name: "Slovaquie",
    code: "SK"
  }, {
    name: "Slovénie",
    code: "SI"
  }, {
    name: "Estonie",
    code: "EE"
  }, {
    name: "Lettonie",
    code: "LV"
  }, {
    name: "Lituanie",
    code: "LT"
  }, {
    name: "Serbie",
    code: "RS"
  }]
}, {
  name: "Océanie",
  expanded: false,
  countries: [{
    name: "Australie",
    code: "AU"
  }, {
    name: "Nouvelle-Zélande",
    code: "NZ"
  }]
}, {
  name: "Afrique",
  expanded: false,
  countries: [{
    name: "Afrique du Sud",
    code: "ZA"
  }, {
    name: "Maroc",
    code: "MA"
  }, {
    name: "Égypte",
    code: "EG"
  }, {
    name: "Nigeria",
    code: "NG"
  }, {
    name: "Kenya",
    code: "KE"
  }]
}, {
  name: "Moyen-Orient",
  expanded: false,
  countries: [{
    name: "Émirats Arabes Unis",
    code: "AE"
  }, {
    name: "Arabie Saoudite",
    code: "SA"
  }, {
    name: "Qatar",
    code: "QA"
  }, {
    name: "Israël",
    code: "IL"
  }, {
    name: "Turquie",
    code: "TR"
  }]
}, {
  name: "Asie",
  expanded: false,
  countries: [{
    name: "Japon",
    code: "JP"
  }, {
    name: "Corée du Sud",
    code: "KR"
  }, {
    name: "Singapour",
    code: "SG"
  }, {
    name: "Malaisie",
    code: "MY"
  }, {
    name: "Indonésie",
    code: "ID"
  }, {
    name: "Thaïlande",
    code: "TH"
  }, {
    name: "Vietnam",
    code: "VN"
  }, {
    name: "Philippines",
    code: "PH"
  }, {
    name: "Inde",
    code: "IN"
  }, {
    name: "Taiwan",
    code: "TW"
  }, {
    name: "Hong Kong",
    code: "HK"
  }]
}];
const CountryFlag = ({
  code
}: {
  code: string;
}) => {
  return <span className="inline-block w-5 h-3 mr-1 align-middle overflow-hidden rounded-sm border border-gray-200 shadow-sm">
      <img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt={`Drapeau ${code}`} className="w-full h-full object-cover" />
    </span>;
};
export function GlobalPresenceSection() {
  const isMobile = useIsMobile();
  const [expandedRegions, setExpandedRegions] = useState<{
    [key: string]: boolean;
  }>({});
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Toggle region expansion
  const toggleRegion = (regionName: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  // Number of countries to show initially
  const initialCountriesToShow = 5;

  // Auto-scroll function for desktop carousel
  useEffect(() => {
    if (isMobile || !carouselRef.current) return;

    // Start auto-scrolling
    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        if (carouselRef.current) {
          const scrollNext = document.querySelector('[data-carousel-next]') as HTMLButtonElement;
          if (scrollNext) {
            scrollNext.click();
          }
        }
      }, 8000); // Scroll every 8 seconds
    };
    startAutoScroll();

    // Clean up the interval when component unmounts
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isMobile]);

  // Helper function to check if all countries for a region are shown initially
  const shouldShowExpandToggle = (region: Region) => {
    return region.countries.length > initialCountriesToShow * 2; // For grid layout
  };

  // Get the map image URL from the Supabase bucket
  const mapImageUrl = "https://khqmoyqakgwdqixnsxzl.supabase.co/storage/v1/object/public/logos/MapChart_Map.png";
  return <section className="py-16 relative overflow-hidden">
      {/* Background Map with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={mapImageUrl} alt="Carte du monde" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-gray-50/90"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="md:w-1/3 mb-8 md:mb-0 pr-0 md:pr-12 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-black sm:text-4xl mb-6">
              <span className="highlight-stabilo">Leader mondial</span> des transactions crypto
            </h2>
            
            <p className="text-md text-gray-800 mb-3 font-normal">Notre smart contrat déployé sur la blockchain Polygon garantit des transactions instantanées et infalsifiables.</p>
            
            <div className="flex items-center mt-4 justify-center md:justify-start">
              <div className="bg-black rounded-full p-2 mr-3">
                <Globe size={20} className="text-white" />
              </div>
              <p className="font-medium text-lg text-black">Présence dans 80+ pays</p>
            </div>
            
            <div className="flex items-center mt-4 justify-center md:justify-start">
              <div className="bg-black rounded-full p-2 mr-3">
                <Bitcoin size={20} className="text-white" />
              </div>
              <p className="font-medium text-lg text-black">Transactions sécurisées</p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            {isMobile ? <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {regions.map(region => <div key={region.name} className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm p-5 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-black">{region.name}</h3>
                      {shouldShowExpandToggle(region) && <button onClick={() => toggleRegion(region.name)} className="p-1 rounded-full hover:bg-gray-200">
                          {expandedRegions[region.name] ? <ChevronUp size={20} className="text-black" /> : <ChevronDown size={20} className="text-black" />}
                        </button>}
                    </div>
                    
                    <div className="flex flex-col gap-y-2.5">
                      {region.countries.slice(0, expandedRegions[region.name] ? undefined : Math.min(initialCountriesToShow, region.countries.length)).map(country => <div key={country.code} className="flex items-center">
                            <CountryFlag code={country.code} />
                            <span className="text-sm text-gray-800">{country.name}</span>
                          </div>)}
                      
                      {!expandedRegions[region.name] && shouldShowExpandToggle(region) && <div className="flex items-center justify-center mt-2">
                          <button onClick={() => toggleRegion(region.name)} className="text-sm text-gray-800 flex items-center gap-1 hover:text-black">
                            Voir plus ({region.countries.length - initialCountriesToShow})
                            <ChevronDown size={16} />
                          </button>
                        </div>}
                    </div>
                  </div>)}
              </div> : <div ref={carouselRef} className="w-full relative">
                <Carousel className="w-full">
                  <CarouselContent className="pb-12">
                    {regions.map(region => <CarouselItem key={region.name} className="md:basis-1/2 lg:basis-1/2" onMouseEnter={() => setHoveredRegion(region.name)} onMouseLeave={() => setHoveredRegion(null)}>
                        <Card className={`h-full bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow ${hoveredRegion === region.name ? 'ring-1 ring-black' : ''}`}>
                          <CardHeader className="pb-1.5">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg text-black">
                                {region.name}
                              </CardTitle>
                              {shouldShowExpandToggle(region) && <button onClick={() => toggleRegion(region.name)} className="text-xs text-gray-600 flex items-center gap-1 hover:text-black">
                                  {expandedRegions[region.name] && region.countries.length > initialCountriesToShow * 2 ? "Réduire" : ""}
                                  {expandedRegions[region.name] && region.countries.length > initialCountriesToShow * 2 ? <ChevronUp size={14} className="ml-1" /> : ""}
                                </button>}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-36 pr-4">
                              <div className="grid grid-cols-2 gap-2">
                                {region.countries.slice(0, expandedRegions[region.name] ? undefined : Math.min(initialCountriesToShow * 2, region.countries.length)).map(country => <div key={country.code} className="flex items-center bg-white/90 rounded-full py-1 px-2 text-xs font-medium text-gray-800 border border-gray-200 hover:bg-gray-50 transition-colors">
                                      <CountryFlag code={country.code} />
                                      {country.name}
                                    </div>)}
                                
                                {!expandedRegions[region.name] && shouldShowExpandToggle(region) && <button onClick={() => toggleRegion(region.name)} className="flex items-center bg-gray-100 rounded-full py-1 px-3 text-xs font-medium text-gray-800 border border-gray-200 w-full justify-center col-span-2 hover:bg-gray-200 transition-colors">
                                    +{region.countries.length - initialCountriesToShow * 2} pays
                                  </button>}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </CarouselItem>)}
                  </CarouselContent>
                  <div className="flex justify-center gap-2 mt-4">
                    <CarouselPrevious data-carousel-prev className="static translate-y-0 bg-white/80 hover:bg-white" />
                    <CarouselNext data-carousel-next className="static translate-y-0 bg-white/80 hover:bg-white" />
                  </div>
                </Carousel>
              </div>}
          </div>
        </div>
      </div>
    </section>;
}