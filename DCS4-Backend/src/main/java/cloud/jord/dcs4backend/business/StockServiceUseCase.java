package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import cloud.jord.dcs4backend.domain.response.StocksResponse;

public interface StockServiceUseCase {
    StockResponse getStock(StockRequest request, String symbol);
    StockHistoryResponse getStockHistory(String symbol);
    StocksResponse getStocks();
}
