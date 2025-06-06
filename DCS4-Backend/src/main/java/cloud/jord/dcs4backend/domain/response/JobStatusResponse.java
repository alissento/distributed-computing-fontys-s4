package cloud.jord.dcs4backend.domain.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

public class JobStatusResponse {
    @JsonProperty("s3_key")
    private String s3_key;
    @JsonProperty("stock_symbol")
    private String processing_type;
    @JsonProperty("processing_type")
    private String jump_days;
    @JsonProperty("start_date")
    private String start_date;
    @JsonProperty("end_date")
    private String end_date;
    @JsonProperty("job_id")
    private String job_id;
    @JsonProperty("job_status")
    private String job_status;
}
