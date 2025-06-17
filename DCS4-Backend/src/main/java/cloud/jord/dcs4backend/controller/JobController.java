package cloud.jord.dcs4backend.controller;

import cloud.jord.dcs4backend.business.JobServiceUseCase;
import cloud.jord.dcs4backend.domain.request.StockRequest;
import cloud.jord.dcs4backend.domain.response.JobStatusResponse;
import cloud.jord.dcs4backend.domain.response.StockResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static org.springframework.http.ResponseEntity.ok;

@RestController
@RequestMapping("/jobs")
@AllArgsConstructor
public class JobController {
    private final JobServiceUseCase jobService;

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping
    public ResponseEntity<String[]> getJobs() {
        String[] response = jobService.getJobs();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("{id}/status")
    public ResponseEntity<JobStatusResponse> getJobStatus(@PathVariable String id) {
        JobStatusResponse response = jobService.getJobStatus(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("{id}/pdf")
    public ResponseEntity<Resource> getJobPdf(@PathVariable String id) {
        Resource response = jobService.getJobPdf(id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_ANALYST')")
    @PostMapping()
    public ResponseEntity<String> createJob(@RequestBody @Valid StockRequest request) {
        String response = jobService.createJob(request);
        return ok(response);
    }
}
