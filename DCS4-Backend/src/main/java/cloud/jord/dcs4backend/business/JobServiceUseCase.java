package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.JobStatusResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;

public interface JobServiceUseCase {
    JobStatusResponse getJobStatus(String jobId);
    String[] getJobs();
    String createJob(StockRequest request);
}
