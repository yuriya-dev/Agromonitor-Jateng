import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface TickerItem {
  name: string;
  price: number;
  change: number;
}

const DUMMY_TICKER: TickerItem[] = [
  { name: "BERAS MEDIUM", price: 13500, change: 1.2 },
  { name: "GULA PASIR", price: 16000, change: -0.5 },
  { name: "MINYAK GORENG", price: 15500, change: 0 },
  { name: "DAGING SAPI", price: 130000, change: 2.1 },
  { name: "TELUR AYAM", price: 28000, change: -1.5 },
  { name: "CABE RAWIT", price: 65000, change: 5.4 },
];

export default function Ticker() {
  return (
    <div className="w-full bg-background border-y border-border-color overflow-hidden flex items-center h-10">
      <div className="flex animate-ticker whitespace-nowrap">
        {/* Duplicate list to make infinite scroll effect */}
        {[...DUMMY_TICKER, ...DUMMY_TICKER, ...DUMMY_TICKER].map((item, index) => {
          const isUp = item.change > 0;
          const isDown = item.change < 0;
          
          return (
            <div key={index} className="flex items-center px-6 border-r border-border-color font-mono text-sm">
              <span className="font-bold mr-3">{item.name}</span>
              <span className="mr-2">Rp {item.price.toLocaleString("id-ID")}</span>
              
              <span className={`flex items-center font-bold ${isUp ? "text-accent-green" : isDown ? "text-accent-red" : "text-accent-grey"}`}>
                {isUp && <ArrowUp size={14} className="mr-1" />}
                {isDown && <ArrowDown size={14} className="mr-1" />}
                {!isUp && !isDown && <Minus size={14} className="mr-1" />}
                {Math.abs(item.change)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
