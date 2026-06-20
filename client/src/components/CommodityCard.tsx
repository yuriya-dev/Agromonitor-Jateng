import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import Link from "next/link";

interface CommodityCardProps {
  id: string;
  name: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  unit: string;
  pasar?: string;
  date?: string;
}

export default function CommodityCard({ id, name, price, changeAmount, changePercent, unit, pasar, date }: CommodityCardProps) {
  const isUp = changeAmount > 0;
  const isDown = changeAmount < 0;

  const queryParams = new URLSearchParams();
  if (pasar) queryParams.set("pasar", pasar);
  if (date) queryParams.set("date", date);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return (
    <Link href={`/komoditas/${id}${queryString}`} className="block">
      <div className="bg-white border-2 border-border-color shadow-brutal hover:shadow-brutal-hover hover:translate-y-[2px] hover:translate-x-[2px] transition-all duration-150 p-4 flex flex-col justify-between group cursor-pointer relative h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-sans font-bold text-lg uppercase tracking-tight">{name}</h3>
        <div className="text-xs font-mono text-accent-grey uppercase bg-surface px-2 py-1 border border-border-color">
          {unit}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-2xl font-bold">
            Rp {price.toLocaleString("id-ID")}
          </div>
          <div className={`font-mono text-sm flex items-center font-bold mt-1 ${isUp ? "text-accent-green" : isDown ? "text-accent-red" : "text-accent-grey"}`}>
            {isUp && <ArrowUp size={16} className="mr-1" />}
            {isDown && <ArrowDown size={16} className="mr-1" />}
            {!isUp && !isDown && <Minus size={16} className="mr-1" />}
            {Math.abs(changeAmount).toLocaleString("id-ID")} ({Math.abs(changePercent)}%)
          </div>
        </div>
        
        <div className="h-10 w-16 opacity-30 flex items-center justify-center">
          {/* Placeholder for Sparkline Mini */}
          <div className={`w-full h-1 ${isUp ? "bg-accent-green" : isDown ? "bg-accent-red" : "bg-accent-grey"}`}></div>
        </div>
      </div>
      
      {/* Decorative Target Border on Hover */}
      <div className={`absolute top-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-300 ${isUp ? "bg-accent-green" : isDown ? "bg-accent-red" : "bg-accent-grey"}`}></div>
    </div>
    </Link>
  );
}
