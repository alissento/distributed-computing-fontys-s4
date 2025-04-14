package cloud.jord.dcs4backend.configuration.auth.token;

public interface AccessTokenUseCase {
    Long getUserId();
    String getEmail();
    String getName();
    String getRole();
}
