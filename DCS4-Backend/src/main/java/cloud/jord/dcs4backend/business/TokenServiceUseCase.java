package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.request.TokenRequest;

public interface TokenServiceUseCase {
    String authenticate(String email, String password);
}
