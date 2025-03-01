
import { useIsMobile } from "@/hooks/use-mobile";
import { Globe } from "lucide-react";

type Region = {
  name: string;
  countries: Country[];
}

type Country = {
  name: string;
  code: string;
}

const regions: Region[] = [
  {
    name: "Amérique du Nord",
    countries: [
      { name: "États-Unis", code: "US" },
      { name: "Canada", code: "CA" },
      { name: "Mexique", code: "MX" }
    ]
  },
  {
    name: "Amérique Latine",
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
    countries: [
      { name: "Australie", code: "AU" },
      { name: "Nouvelle-Zélande", code: "NZ" }
    ]
  },
  {
    name: "Afrique",
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
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
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
              <div className="flex flex-col space-y-6">
                {regions.map((region) => (
                  <div key={region.name} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{region.name}</h3>
                    <div className="flex flex-wrap gap-y-3">
                      {region.countries.map((country) => (
                        <div key={country.code} className="w-1/2 flex items-center">
                          <CountryFlag code={country.code} />
                          <span className="text-sm">{country.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {regions.map((region) => (
                  <div key={region.name} className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{region.name}</h3>
                    <div className="flex flex-wrap gap-4">
                      {region.countries.map((country) => (
                        <div 
                          key={country.code}
                          className="flex items-center bg-gray-50 rounded-full py-2 px-4 text-sm font-medium text-gray-700"
                        >
                          <CountryFlag code={country.code} />
                          {country.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
