package cloud.jord.dcs4backend.configuration.auth.token;

public interface AccessTokenDecoderUseCase {
    AccessTokenUseCase decode(String accessTokenEncoded);
}
