package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import cloud.jord.dcs4backend.domain.response.StocksResponse;
import org.springframework.stereotype.Service;

@Service
public class StockService implements StockServiceUseCase {
    @Override
    public StockResponse getStock(StockRequest request, String symbol) {
        return null;
    }

    @Override
    public StockHistoryResponse getStockHistory(String symbol) {
        return null;
    }

    @Override
    public StocksResponse getStocks() {
        return null;
    }
}
