package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.JobStatusResponse;
import cloud.jord.dcs4backend.domain.response.StockHistoryResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class JobService implements JobServiceUseCase {
    @Value("${process_api.base_url}")
    private String processApiUrl;

    @Value("${process_api.token}")
    private String processApiToken;

    private final RestClient restClient = RestClient.create(processApiUrl);

    @Override
    public JobStatusResponse getJobStatus(String jobId) {
        JobStatusResponse response = restClient.get()
                .uri("http://localhost:8080/jobs/{jobId}/status", jobId)
                .retrieve()
                .body(JobStatusResponse.class);
        return response;
    }

    @Override
    public String[] getJobs() {
        String[] response = restClient.get()
                .uri("http://localhost:8080/jobs")
                .retrieve()
                .body(String[].class);
        return response;

    }

    @Override
    public String createJob(StockRequest request) {
        // had to convert dates to strings lol
        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("stock_symbol", request.getStock_symbol());
        requestMap.put("processing_type", request.getProcessing_type());
        requestMap.put("jump_days", request.getJump_days());
        requestMap.put("start_date", String.format("%tF", request.getStart_date()));
        requestMap.put("end_date", String.format("%tF", request.getEnd_date()));

        String response = restClient.post()
                .uri("http://localhost:8080//jobs")
                .body(requestMap)
                .retrieve()
                .body(String.class);
        return response;
    }

    @Override
    public Resource getJobPdf(String id) {
        Resource response = restClient.get()
                .uri("http://localhost:8080/jobs/{id}/pdf", id)
                .retrieve()
                .body(Resource.class);
        return response;
    }
}
