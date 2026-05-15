import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface TickerProps {
  items: {
    name: string;
    price: number;
    changePercent: number;
  }[];
}

export default function Ticker({ items }: TickerProps) {
  const tickerItems = items && items.length > 0 ? items : [];

  return (
    <div className="w-full bg-background border-y border-border-color overflow-hidden flex items-center h-10">
      <div className="flex animate-ticker whitespace-nowrap">
        {/* Duplicate list to make infinite scroll effect */}
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => {
          const isUp = item.changePercent > 0;
          const isDown = item.changePercent < 0;
          
          return (
            <div key={index} className="flex items-center px-6 border-r border-border-color font-mono text-sm">
              <span className="font-bold mr-3">{item.name}</span>
              <span className="mr-2">Rp {item.price.toLocaleString("id-ID")}</span>
              
              <span className={`flex items-center font-bold ${isUp ? "text-accent-green" : isDown ? "text-accent-red" : "text-accent-grey"}`}>
                {isUp && <ArrowUp size={14} className="mr-1" />}
                {isDown && <ArrowDown size={14} className="mr-1" />}
                {!isUp && !isDown && <Minus size={14} className="mr-1" />}
                {Math.abs(item.changePercent)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
