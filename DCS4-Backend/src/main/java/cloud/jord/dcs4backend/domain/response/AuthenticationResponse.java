package cloud.jord.dcs4backend.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String status; // "authenticated", "totp_required", "totp_setup_required"
    private String token; // Full JWT token for "authenticated", temp token for "totp_required"
    private UserInfoResponse user; // Only for "authenticated" status
    private String email; // For TOTP flow identification
} 