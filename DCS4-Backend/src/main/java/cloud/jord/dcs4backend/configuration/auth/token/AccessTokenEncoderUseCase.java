package cloud.jord.dcs4backend.configuration.auth.token;

public interface AccessTokenEncoderUseCase {
    String encode(AccessTokenUseCase accessToken);
}
