import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltipContent } from "./ui/chart"

// Sample data for the chart
const generateMarketData = () => {
    const data = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 0; i < 12; i++) {
        const spValue = 4000 + Math.random() * 1000
        const nasdaqValue = 12000 + Math.random() * 2000
        const dowValue = 32000 + Math.random() * 3000

        data.push({
            month: months[i],
            sp500: spValue,
            nasdaq: nasdaqValue,
            dow: dowValue,
        })
    }

    return data
}

// Define the market data type
interface MarketDataPoint {
    month: string
    sp500: number
    nasdaq: number
    dow: number
}

export function MarketSummary() {
    const [data, setData] = useState<MarketDataPoint[]>([])

    useEffect(() => {
        setData(generateMarketData())
    }, [])

    const chartConfig = {
        sp500: {
            label: "S&P 500",
            color: "var(--chart-1)",
        },
        nasdaq: {
            label: "NASDAQ",
            color: "var(--chart-2)",
        },
        dow: {
            label: "DOW",
            color: "var(--chart-3)",
        },
    }

    return (
        <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSp500" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNasdaq" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="sp500" stroke="var(--chart-1)" fillOpacity={1} fill="url(#colorSp500)" />
                    <Area
                        type="monotone"
                        dataKey="nasdaq"
                        stroke="var(--chart-2)"
                        fillOpacity={1}
                        fill="url(#colorNasdaq)"
                    />
                    <Area type="monotone" dataKey="dow" stroke="var(--chart-3)" fillOpacity={1} fill="url(#colorDow)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    )
}