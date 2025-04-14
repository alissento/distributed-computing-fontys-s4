package cloud.jord.dcs4backend.configuration.auth.token;

import lombok.EqualsAndHashCode;
import lombok.Getter;


@EqualsAndHashCode
public class AccessToken implements AccessTokenUseCase {
    private final Long userId;
    private final String email;
    private final String name;
    private final String role;

    public AccessToken(String email, Long userId) {
        this(email, userId, null, null);
    }

    public AccessToken(String email, Long userId, String name, String role) {
        this.email = email;
        this.userId = userId;
        this.name = name;
        this.role = role;
    }

    @Override
    public Long getUserId() {
        return userId;
    }

    @Override
    public String getEmail() {
        return email;
    }
    
    @Override
    public String getName() {
        return name;
    }
    
    @Override
    public String getRole() {
        return role;
    }
}
