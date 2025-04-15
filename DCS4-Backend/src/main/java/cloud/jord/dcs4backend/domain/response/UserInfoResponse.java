package cloud.jord.dcs4backend.domain.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserInfoResponse {
    private final String id;
    private final String email;
    private final String name;
    private final String role;
} 