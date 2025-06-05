package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import cloud.jord.dcs4backend.domain.response.StocksResponse;

public interface StockServiceUseCase {
    StockHistoryResponse getStockHistory(String symbol);
    StocksResponse getStocks();
}
