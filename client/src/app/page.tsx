import Ticker from "@/components/Ticker";
import CommodityCard from "@/components/CommodityCard";
import SearchBar from "@/components/SearchBar";
import MapFilter from "@/components/MapFilter";
import RegionDateFilter from "@/components/RegionDateFilter";
import ExportButton from "@/components/ExportButton";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

interface CommoditySummary {
  id: string;
  name: string;
  unit: string;
  price: number;
  changeAmount: number;
  changePercent: number;
}

export default async function Home({ searchParams }: { searchParams: { q?: string, pasar?: string, date?: string } }) {
  let commodities: CommoditySummary[] = [];
  try {
    const apiQuery = new URLSearchParams();
    if (searchParams.pasar) {
      apiQuery.set('pasar', searchParams.pasar);
    }
    if (searchParams.date) {
      apiQuery.set('date', searchParams.date);
    }

    // Gunakan URL absolute karena ini dijalankan di server
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const res = await fetch(`${API_BASE_URL}/api/commodities${apiQuery.toString() ? `?${apiQuery.toString()}` : ''}`, {
      cache: 'no-store' // selalu ambil data terbaru
    });
    const data = await res.json();
    if (data.success) {
      commodities = data.data;
    }
  } catch (error) {
    console.error("Gagal mengambil data komoditas:", error);
  }

  const query = searchParams.q?.toLowerCase() || "";
  const filteredCommodities = commodities.filter((commodity) => 
    commodity.name.toLowerCase().includes(query) || commodity.id.toLowerCase().includes(query)
  );

  // Siapkan data untuk Export CSV
  const exportRows = filteredCommodities.map((item) => [
    `"${item.id}"`,
    `"${item.name}"`,
    `"${searchParams.pasar || "Rata-rata Jawa Tengah"}"`,
    item.price,
    item.changeAmount,
    item.changePercent,
    `"${item.unit}"`
  ]);

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Client-side Header with auth state */}
      <Header />
      <Ticker items={commodities} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Map and Commodity Filter */}
          <div className="w-full lg:w-2/3 flex flex-col space-y-6">
            <div className="bg-surface p-4 border-2 border-border-color shadow-brutal">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Filter Komoditas</h2>
              <SearchBar />
            </div>
            
            <div className="bg-surface p-4 border-2 border-border-color shadow-brutal">
              <MapFilter showHeader={true} />
            </div>
          </div>

          {/* Right Column - Region/Date Filter and Commodity Items */}
          <div className="w-full lg:w-2/3 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b-2 border-border-color pb-4 gap-4 sm:gap-0">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-tight">Market Overview</h2>
                <p className="font-mono text-sm text-accent-grey mt-1">
                  Data Harga Komoditas {searchParams.pasar ? `di ${searchParams.pasar.toUpperCase()}` : "Rata-rata Jawa Tengah"} • {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <ExportButton 
                  filename={searchParams.pasar ? `harga_komoditas_${searchParams.pasar}_${new Date().toISOString().split('T')[0]}.csv` : `harga_komoditas_jateng_${new Date().toISOString().split('T')[0]}.csv`}
                  headers={["ID Komoditas", "Nama Komoditas", "Pasar", "Harga", "Perubahan (Rp)", "Perubahan (%)", "Satuan"]}
                  rows={exportRows}
                />
                <RegionDateFilter />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCommodities.length > 0 ? (
                filteredCommodities.map((commodity, index) => (
                  <CommodityCard
                    key={index}
                    id={commodity.id}
                    name={commodity.name}
                    price={commodity.price}
                    changeAmount={commodity.changeAmount}
                    changePercent={commodity.changePercent}
                    unit={commodity.unit}
                    pasar={searchParams.pasar}
                    date={searchParams.date}
                  />
                ))
              ) : (
                <div className="col-span-full py-10 text-center font-mono text-accent-grey border-2 border-dashed border-border-color">
                  TIDAK ADA KOMODITAS YANG DITEMUKAN
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
