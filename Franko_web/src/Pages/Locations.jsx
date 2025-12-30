import { useEffect, useMemo, useState } from "react";
import { Input, Table, Empty } from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import StickyFooter from "../Component/Footer";


const locations = [
    {
      title: "ADABRAKA",
      address: "OPPOSITE ROXY BUS STOP ADABRAKA - ACCRA",
      tel: "0264189099",
      lat: 5.558,
      lng: -0.2057,
    },
    {
      title: "ACCRA",
      address: "UTC NEAR DESPITE BUILDING",
      tel: "0561925889",
      lat: 5.552,
      lng: -0.2022,
    },
    {
      title: "CIRCLE",
      address: "NEAR ODO RICE BUILDING",
      tel: "0302250396",
      lat: 5.5599,
      lng: -0.2076,
    },
    {
      title: "CIRCLE",
      address: "OPPOSITE ODO RICE BUILDING",
      tel: "0261506861",
      lat: 5.559,
      lng: -0.207,
    },
    
    {
      title: "CIRCLE",
      address: "ADJACENT ODO RICE BUILDING",
      tel: "0509842053",
      lat: 5.5591,
      lng: -0.2069,
    },
    {
      title: "OSU",
      address: "OXFORD STREET BEHIND VODAFONE OFFICE",
      tel: "0302772103",
      lat: 5.557,
      lng: -0.182,
    },
    {
      title: "TEMA",
      address: "COMMUNITY 1 STADIUM ROAD OPPOSITE WATER WORKS",
      tel: "0303214499",
      lat: 5.678,
      lng: -0.0166,
    },
    {
      title: "MADINA",
      address: "MADINA OLD ROAD AROUND ABSA BANK, REPUBLIC BANK",
      tel: "0241184688",
      lat: 5.683,
      lng: -0.1654,
    },
    {
      title: "HAATSO",
      address: "HAATSO STATION/BEIGE CAPITAL BUILDING, OPPOSITE MTN",
      tel: "0243628837",
      lat: 5.653,
      lng: -0.213,
    },
    {
      title: "LAPAZ",
      address: "NII BOI JUNCTION OPPOSITE PRUDENTIAL BANK",
      tel: "0561944202",
      lat: 5.607,
      lng: -0.235,
    },
    {
      title: "KASOA",
      address: "OPPOSITE POLYCLINIC",
      tel: "0264084686",
      lat: 5.534,
      lng: -0.4244,
    },
    {
      title: "KOFORIDUA",
      address: "ALL NATION UNIVERSITY TOWERS, PRINCE BOATENG AROUND ABOUT",
      tel: "0268313323",
      lat: 6.09,
      lng: -0.259,
    },
    {
      title: "KUMASI",
      address: "OPPOSITE HOTEL DE KINGSWAY",
      tel: "0322041018",
      lat: 6.692,
      lng: -1.618,
    },
    {
      title: "KUMASI",
      address: "ASEDA HOUSE OPPOSITE CHALLENGE BOOKSHOP",
      tel: "0322081949",
      lat: 6.688,
      lng: -1.622,
    },
    {
      title: "KUMASI",
      address: "ADJACENT MELCOM ADUM",
      tel: "0322047303",
      lat: 6.693,
      lng: -1.619,
    },
    {
      title: "KUMASI",
      address: "NEAR BARCLAYS BANK",
      tel: "0206310483",
      lat: 6.691,
      lng: -1.6225,
    },
    {
      title: "KUMASI",
      address: "NEAR KUFFOUR CLINIC",
      tel: "0501538602",
      lat: 6.694,
      lng: -1.621,
    },
    {
      title: "KUMASI",
      address: "OPPOSITE KEJETIA",
      tel: "0501525698",
      lat: 6.69,
      lng: -1.623,
    },
    {
      title: "HO",
      address: "OPPOSITE AMEGASHI (GOD IS GREAT BUILDING)",
      tel: "0362025775",
      lat: 6.612,
      lng: 0.47,
    },
    {
      title: "HO ANNEX",
      address: "NEAR THE HO MAIN STATION",
      tel: "0501647165",
      lat: 6.6125,
      lng: 0.4695,
    },
    {
      title: "SUNYANI",
      address: "OPPOSITE COCOA BOARD",
      tel: "0202765836",
      lat: 7.34,
      lng: -2.326,
    },
    {
      title: "TECHIMAN",
      address: "TECHIMAN TAXI RANK NEAR REPUBLIC BANK",
      tel: "0352522426",
      lat: 7.583,
      lng: -1.939,
    },
    {
      title: "BEREKUM",
      address: "BEREKUM ROUNDABOUT OPPOSITE SG-SSB BANK",
      tel: "0209835344",
      lat: 7.456,
      lng: -2.586,
    },
    {
      title: "CAPE COAST",
      address: "LONDON BRIDGE OPPOSITE OLD GUINNESS DEPOT",
      tel: "0264212339",
      lat: 5.106,
      lng: -1.246,
    },
    {
      title: "TAKORADI",
      address: "CAPE COAST STATION NEAR SUPER STAR HOTEL",
      tel: "0249902589",
      lat: 4.889,
      lng: -1.755,
    },
    {
      title: "TARKWA",
      address: "TARKWA STATION NEAR THE SHELL FILLING STATION",
      tel: "0312320144",
      lat: 5.312,
      lng: -1.995,
    },
    {
      title: "TAMALE",
      address: "OLD SALAGA STATION NEAR PK",
      tel: "0265462241",
      lat: 9.407,
      lng: -0.853,
    },
    {
      title: "HOHOE",
      address: "JAHLEX STORE NEAR THE TRAFFIC LIGHT",
      tel: "0558106241",
      lat: 7.15,
      lng: 0.473,
    },
    {
      title: "WA",
      address: "ZONGO OPPOSITE MAMA'S KITCHEN",
      tel: "0261915228",
      lat: 10.06,
      lng: -2.501,
    },
    {
      title: "WA",
      address: "WA MAIN STATION",
      tel: "0507316718",
      lat: 10.0605,
      lng: -2.5005,
    },
    {
      title: "BOLGA",
      address: "COMMERCIAL STREET NEAR ACCESS BANK",
      tel: "0501538603",
      lat: 10.787,
      lng: -0.851,
    },
    {
      title: "OBUASI",
      address: "CENTRAL MOSQUE-OPPOSITE ADANSI RURAL BANK",
      tel: "0263535131",
      lat: 6.204,
      lng: -1.666,
    },
    {
      title: "SWEDRU",
      address: "OPPOSITE MELCOM",
      tel: "0557872937",
      lat: 5.532,
      lng: -0.682,
    },
    {
      title: "ASHIAMAN",
      address: "OPPOSITE MAIN LORRY STATION",
      tel: "0509570736",
      lat: 5.688,
      lng: -0.04,
    },
    {
      title: "CIRCLE SERVICE CENTER",
      address: "NEAR ODO RICE",
      tel: "0501575745",
      lat: 5.5597,
      lng: -0.208,
    },
    {
      title: "KUMASI SERVICE CENTER",
      address: "ADUM BEHIND THE OLD MELCOM BUILDING",
      tel: "0322033821",
      lat: 6.693,
      lng: -1.619,
    },
    {
      title: "TAMALE SERVICE CENTER",
      address: "ADJACENT QUALITY FIRST SHOPPING CENTER",
      tel: "0501505020",
      lat: 9.411,
      lng: -0.856,
    },
    {
      title: "TOGO",
      address: "",
      tel: "+228 92 01 97 45",
      lat: 6.137,
      lng: 1.212,
    },
  ];

const columns = [
  {
    title: "Branch",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
    render: (text, record) => (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${record.lat},${record.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {text}
      </a>
    ),
  },
  {
    title: "Telephone",
    dataIndex: "tel",
    key: "tel",
    render: (text) => (
      <a href={`tel:${text}`} style={{ textDecoration: "none", color: "inherit" }}>
        {text}
      </a>
    ),
  },
];




const ShopsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return locations;

    return locations.filter((location) => {
      const title = (location?.title || "").toLowerCase();
      const address = (location?.address || "").toLowerCase();
      const tel = String(location?.tel || "");
      return title.includes(term) || address.includes(term) || tel.includes(term);
    });
  }, [searchTerm]);

  const enhancedColumns = useMemo(() => {
    return (columns || []).map((c) => ({
      ...c,
      title: <span className="text-gray-700 font-semibold">{c.title}</span>,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#f0fdf4]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur border border-[#bbf7d0] rounded-3xl p-6 shadow-[0_14px_40px_-28px_rgba(34,197,94,0.7)]">
            <div className="flex items-start gap-4">
            

              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-3xl font-extrabold text-[#14532d]">
                  Our Shops
                </h2>
            

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <Input
                      size="large"
                      placeholder="Search by branch"
                      prefix={<SearchOutlined className="text-[#15803d]" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      allowClear
                      className="w-full"
                      // AntD sometimes ignores Tailwind border colors on focus; force it:
                      style={{
                        borderRadius: 9999,
                      }}
                      // Tailwind on wrapper (works well with AntD focus-within)
                      rootClassName="!rounded-full !border-[#bbf7d0] focus-within:!border-[#22c55e] focus-within:!shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                    />
                  </div>

                  <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-sm font-extrabold">
                    {filteredLocations.length} result{filteredLocations.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredLocations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#bbf7d0] p-10 shadow-sm">
            <Empty
              description={
                <div className="text-[#166534]">
                  No shops match <span className="font-extrabold">“{searchTerm}”</span>.
                </div>
              }
            />
          </div>
        ) : (
          <>
            {/* Table (desktop) */}
            <div className="hidden sm:block">
              <div className="bg-white rounded-3xl border border-[#bbf7d0] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#bbf7d0] bg-[#f0fdf4]">
                  <p className="text-sm font-extrabold text-[#14532d]">All locations</p>
                  <p className="text-xs text-[#166534]">
                    Click an address to open Google Maps or call directly.
                  </p>
                </div>

                <div className="[&_.ant-pagination]:!justify-center [&_.ant-pagination]:!flex p-2">
                  <Table
                    dataSource={filteredLocations}
                    columns={enhancedColumns}
                    rowKey={(record, index) => index}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    size="middle"
                    rowClassName={(_, idx) =>
                      idx % 2 === 0 ? "bg-white" : "bg-[#f0fdf4]"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Cards (mobile) */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
              {filteredLocations.map((shop, index) => {
                const lat = shop?.lat;
                const lng = shop?.lng;

                const hasCoords =
                  lat !== undefined && lng !== undefined && lat !== null && lng !== null;

                const mapHref = hasCoords
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${lat},${lng}`
                    )}`
                  : shop?.address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        shop.address
                      )}`
                    : null;

                const tel = shop?.tel ? String(shop.tel) : "";

                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl border border-[#bbf7d0] shadow-sm overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-md  font-bold  truncate">
                            {shop?.title || "Shop"}
                          </h3>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-start gap-2">
                              <EnvironmentOutlined className="text-[#15803d] mt-1" />
                              {mapHref ? (
                                <a
                                  href={mapHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-500 "
                                >
                                  {shop?.address || "Open in Maps"}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  Address not available
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <PhoneOutlined className="text-[#15803d]" />
                              {tel ? (
                                <a
                                  href={`tel:${tel}`}
                                  className="text-sm text-gray-700"
                                >
                                  {tel}
                                </a>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  Phone not available
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <a
                          href={mapHref || "#"}
                          target={mapHref ? "_blank" : undefined}
                          rel={mapHref ? "noopener noreferrer" : undefined}
                          className={`text-center py-3 rounded-2xl font-extrabold text-sm border transition ${
                            mapHref
                              ? "bg-[#22c55e] hover:bg-[#16a34a] text-white border-[#22c55e]"
                              : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                          }`}
                        >
                          Directions
                        </a>

                        <a
                          href={tel ? `tel:${tel}` : "#"}
                          className={`text-center py-3 rounded-2xl font-extrabold text-sm border transition ${
                            tel
                              ? "bg-white text-[#15803d] border-[#bbf7d0] hover:bg-[#f0fdf4]"
                              : "bg-gray-100 text-gray-400 border-gray-200 pointer-events-none"
                          }`}
                        >
                          Call
                        </a>
                      </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#bbf7d0]" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <StickyFooter/>
    </div>
  );
};

export default ShopsPage;