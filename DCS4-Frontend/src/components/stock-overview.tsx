import { ArrowDown, ArrowUp } from "lucide-react"
import { Progress } from "./ui/progress"

const stockOverview = [
    {
        symbol: "AAPL",
        name: "Apple Inc.",
        price: 173.42,
        change: 2.35,
        prediction: 85,
    },
    {
        symbol: "MSFT",
        name: "Microsoft Corp.",
        price: 328.79,
        change: 1.87,
        prediction: 82,
    },
    {
        symbol: "GOOGL",
        name: "Alphabet Inc.",
        price: 142.56,
        change: -0.78,
        prediction: 76,
    },
    {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        price: 178.35,
        change: 3.21,
        prediction: 89,
    },
    {
        symbol: "TSLA",
        name: "Tesla Inc.",
        price: 175.21,
        change: -1.45,
        prediction: 72,
    },
]

export function StockOverview() {
    return (
        <div className="space-y-4">
            {stockOverview.map((stock) => (
                <div key={stock.symbol} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{stock.symbol}</p>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">${stock.price.toFixed(2)}</p>
                            <div className="flex items-center">
                                {stock.change > 0 ? (
                                    <ArrowUp className="h-3 w-3 text-green-500" />
                                ) : (
                                    <ArrowDown className="h-3 w-3 text-red-500" />
                                )}
                                <span className={`text-sm ${stock.change > 0 ? "text-green-500" : "text-red-500"}`}>
                  {stock.change > 0 ? "+" : ""}
                                    {stock.change.toFixed(2)}%
                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Progress value={stock.prediction} className="h-2" />
                        <span className="text-xs font-medium">{stock.prediction}%</span>
                    </div>
                </div>
            ))}
        </div>
    )
}