import apiClient from "@/config/apiClient.ts";

type StocksResponse = {
    stocks: string[]
};

const StocksAPI = {
    getStocks: async (): Promise<StocksResponse> => {
        const response = await apiClient.get('stocks');
        return response.data;
    }
}

export default StocksAPI;