import { ArrowDown, ArrowUp } from "lucide-react"
import { Badge } from "./ui/badge"

const highConvictionPredictions = [
    {
        id: 1,
        stock: "AAPL",
        prediction: "up",
        confidence: 92,
        timeframe: "1 week",
        potentialReturn: "+4.2%",
    },
    {
        id: 2,
        stock: "MSFT",
        prediction: "up",
        confidence: 89,
        timeframe: "2 weeks",
        potentialReturn: "+3.7%",
    },
    {
        id: 3,
        stock: "TSLA",
        prediction: "down",
        confidence: 87,
        timeframe: "1 week",
        potentialReturn: "-5.1%",
    },
    {
        id: 4,
        stock: "AMZN",
        prediction: "up",
        confidence: 86,
        timeframe: "1 month",
        potentialReturn: "+7.3%",
    },
    {
        id: 5,
        stock: "NVDA",
        prediction: "up",
        confidence: 91,
        timeframe: "2 weeks",
        potentialReturn: "+6.8%",
    },
]

export function HighConvictionPredictions() {
    return (
        <div className="space-y-4">
            {highConvictionPredictions.map((prediction) => (
                <div key={prediction.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center space-x-4">
                        <div
                            className={`rounded-full p-2 ${
                                prediction.prediction === "up"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                            {prediction.prediction === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className="font-medium">{prediction.stock}</p>
                            <p className="text-sm text-muted-foreground">{prediction.timeframe}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <Badge variant="outline" className="mb-1">
                            {prediction.confidence}% confidence
                        </Badge>
                        <span
                            className={`text-sm font-medium ${
                                prediction.prediction === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}
                        >
              {prediction.potentialReturn}
            </span>
                    </div>
                </div>
            ))}
        </div>
    )
}