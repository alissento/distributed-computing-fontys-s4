package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import cloud.jord.dcs4backend.domain.response.StocksResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class StockService implements StockServiceUseCase {
    @Value("${process_api.base_url}")
    private String processApiUrl;

    @Value("${process_api.token}")
    private String processApiToken;

    private final RestClient restClient = RestClient.create(processApiUrl);

    @Override
    public StockHistoryResponse getStockHistory(String symbol) {
        StockHistoryResponse response = restClient.get()
                .uri("/stocks/{symbol}", symbol)
                .retrieve()
                .body(StockHistoryResponse.class);
        return response;
    }

    @Override
    public StocksResponse getStocks() {
        List<String> response = restClient.get()
                .uri("http://localhost:8080/stocks")
                .retrieve()
                .body(List.class);
        return new StocksResponse(response);
    }
}
