package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.configuration.auth.token.AccessToken;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenEncoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.exceptions.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.ConcurrentHashMap;

@Service
@AllArgsConstructor
public class TokenService implements TokenServiceUseCase {
    UserServiceUseCase userService;
    AccessTokenEncoderUseCase TokenEncoder;
    AccessTokenDecoderUseCase TokenDecoder;
    
    // Store for invalidated tokens
    // Replace with distributed cache like Redis
    private static final Set<String> invalidatedTokens = ConcurrentHashMap.newKeySet();

    @Override
    public String authenticate(String email, String password) {
        validateCredentials(email, password);
        
        User user = userService.getUser(email);

        // Generate AccessToken
        AccessTokenUseCase token = new AccessToken(
            email,
            user.getId(),
            user.getName(),
            user.getRole().name()
        );

        // Encode the token
        return TokenEncoder.encode(token);
    }
    
    @Override
    public String authenticateWithTotpVerified(String email) {
        User user = userService.getUser(email);

        // Generate AccessToken (TOTP already verified)
        AccessTokenUseCase token = new AccessToken(
            email,
            user.getId(),
            user.getName(),
            user.getRole().name()
        );

        // Encode the token
        return TokenEncoder.encode(token);
    }
    
    @Override
    public void validateCredentials(String email, String password) {
        User user;

        try {
            user = userService.getUser(email);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException("Invalid username or password");
        }

        if (PasswordManager.passwordIsInvalid(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }
    }
    
    @Override
    public void invalidateToken(String token) {
        try {
            AccessTokenUseCase accessToken = TokenDecoder.decode(token);
            invalidatedTokens.add(token);
        } catch (Exception e) {
            // If token is invalid, just ignore silently - user is effectively already logged out
        }
    }
    
    @Override
    public String refreshToken(String token) {
        // Verify the token is valid
        if (invalidatedTokens.contains(token)) {
            throw new RuntimeException("Token has been invalidated");
        }
        
        AccessTokenUseCase decodedToken;
        try {
            decodedToken = TokenDecoder.decode(token);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
        
        Long userId = decodedToken.getUserId();
        
        // Get the latest user information
        User user;
        try {
            user = userService.getUser(userId);
        } catch (ResourceNotFoundException e) {
            throw new RuntimeException("User no longer exists");
        }
        
        // Invalidate the old token
        invalidatedTokens.add(token);
        
        // Create a new token with refreshed information
        AccessTokenUseCase newToken = new AccessToken(
            user.getEmail(),
            user.getId(),
            user.getName(),
            user.getRole().name()
        );
        
        // Return the new encoded token
        return TokenEncoder.encode(newToken);
    }
}
