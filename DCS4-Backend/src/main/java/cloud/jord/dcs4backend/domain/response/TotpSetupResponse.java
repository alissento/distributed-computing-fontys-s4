package cloud.jord.dcs4backend.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TotpSetupResponse {
    private String secret;
    private String manualEntryKey;
    private String qrCodeDataUrl;
} 