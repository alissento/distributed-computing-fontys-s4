package cloud.jord.dcs4backend.domain.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TotpSetupRequest {
    private String code;
    private String secret;
} 