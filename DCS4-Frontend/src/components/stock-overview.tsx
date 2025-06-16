import StocksAPI from "@/api/StocksAPI.ts";
import {useAuth} from "@/contexts/AuthContext.tsx";
import {useEffect, useState} from "react";

async function getStocks() {
    const response = await StocksAPI.getStocks();
    return response.stocks;
}

export function StockOverview() {
    const {isAuthenticated, isLoading} = useAuth();
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        if (!isAuthenticated || isLoading) {
            return;
        }

        getStocks()
            .then((data) => setStocks(data))
    }, [isAuthenticated, isLoading]);

    if (!isAuthenticated || isLoading) {
        return null;
    }

    return (
        (stocks?.length > 0 && (
            <div className="space-y-4">
                {stocks.slice(0, 8).map((stock) => (
                    <div key={stock} className="flex flex-col space-y-2">
                        <p className="text-sm font-medium">{stock}</p>
                    </div>
                ))}
            </div>
        ))
    )
}