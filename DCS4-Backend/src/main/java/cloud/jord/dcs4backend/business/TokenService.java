package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.configuration.auth.token.AccessToken;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenEncoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.exceptions.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TokenService implements TokenServiceUseCase {
    UserServiceUseCase userService;
    AccessTokenEncoderUseCase TokenEncoder;

    @Override
    public String authenticate(String email, String password) {
        User user;

        try {
            user = userService.getUser(email);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException("Invalid username or password");
        }

        if (PasswordManager.passwordIsInvalid(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Generate AccessToken
        AccessTokenUseCase token = new AccessToken(email, user.getId());

        // Encode the token
        return TokenEncoder.encode(token);
    }
}
