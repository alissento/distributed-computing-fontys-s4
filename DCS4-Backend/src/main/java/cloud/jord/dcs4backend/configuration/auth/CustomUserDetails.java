package cloud.jord.dcs4backend.configuration.auth;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
public class CustomUserDetails implements UserDetails {
    private final Long userId;
    private final String username;
    private final String email;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long userId, String username, String email, Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.username = email;
        this.email = email;
        this.authorities = authorities;
    }

    @Override
    public String getPassword() {
        return "";
    }
}
