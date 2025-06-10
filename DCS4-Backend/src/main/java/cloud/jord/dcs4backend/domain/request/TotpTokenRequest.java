package cloud.jord.dcs4backend.domain.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TotpTokenRequest {
    private String email;
    private String totpCode;
} 