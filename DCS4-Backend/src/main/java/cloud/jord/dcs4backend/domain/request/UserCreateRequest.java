package cloud.jord.dcs4backend.domain.request;

import cloud.jord.dcs4backend.domain.Role;
import lombok.Getter;

@Getter
public class UserCreateRequest {
    private String name;
    private String email;
    private String password;
}
