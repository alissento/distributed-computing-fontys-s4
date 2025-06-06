package cloud.jord.dcs4backend.domain.exceptions;

import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class ErrorDetails {
    private final String error;
    private final LocalDateTime timestamp;
    private final String details;

    public ErrorDetails(String error, String details) {
        this.error = error;
        this.timestamp = LocalDateTime.now();
        this.details = details;
    }
}
