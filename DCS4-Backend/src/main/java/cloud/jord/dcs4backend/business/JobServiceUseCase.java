package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.JobStatusResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import org.springframework.core.io.Resource;

public interface JobServiceUseCase {
    JobStatusResponse getJobStatus(String jobId);
    String[] getJobs();
    String createJob(StockRequest request);
    Resource getJobPdf(String id);
}
