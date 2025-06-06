package cloud.jord.dcs4backend.controller;

import cloud.jord.dcs4backend.business.StockServiceUseCase;
import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import cloud.jord.dcs4backend.domain.response.StocksResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("/stocks")
@AllArgsConstructor
public class StockController {
    private final StockServiceUseCase stockService;

    @GetMapping
    public ResponseEntity<StocksResponse> getStocks() {
        StocksResponse response = stockService.getStocks();
        return ok(response);
    }

    @GetMapping("{symbol}")
    public ResponseEntity<StockHistoryResponse> getStockHistory(String symbol) {
        StockHistoryResponse response = stockService.getStockHistory(symbol);
        return ok(response);
    }
}
