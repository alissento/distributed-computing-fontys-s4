package cloud.jord.dcs4backend.configuration.auth.token;


public interface AccessTokenUseCase {
    String getSubject();

    Long getUserId();
}
