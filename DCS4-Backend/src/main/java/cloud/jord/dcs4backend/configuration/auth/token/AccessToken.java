package cloud.jord.dcs4backend.configuration.auth.token;

import lombok.EqualsAndHashCode;
import lombok.Getter;


@EqualsAndHashCode
public class AccessToken implements AccessTokenUseCase {
    private final String subject;
    private final Long userId;

    public AccessToken(String subject, Long userId) {
        this.subject = subject;
        this.userId = userId;
    }

    @Override
    public String getSubject() {
        return subject;
    }

    @Override
    public Long getUserId() {
        return userId;
    }
}
