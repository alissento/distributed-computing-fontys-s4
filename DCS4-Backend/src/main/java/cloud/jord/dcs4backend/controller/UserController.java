package cloud.jord.dcs4backend.controller;

import cloud.jord.dcs4backend.business.TokenServiceUseCase;
import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.business.TotpServiceUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;
import cloud.jord.dcs4backend.domain.response.TokenResponse;
import cloud.jord.dcs4backend.domain.response.AuthenticationResponse;
import cloud.jord.dcs4backend.domain.response.TotpSetupResponse;
import cloud.jord.dcs4backend.domain.response.UserInfoResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserServiceUseCase userService;
    private final TokenServiceUseCase tokenService;
    private final TotpServiceUseCase totpService;
    private final AccessTokenDecoderUseCase tokenDecoder;

    @PostMapping()
    public ResponseEntity<AuthenticationResponse> create(@RequestBody UserCreateRequest request, HttpServletResponse response) {
        // Create user account
        userService.create(request);
        
        // Get the created user
        User user = userService.getUser(request.getEmail());
        
        // Generate TOTP secret for new user
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        user.setTotpEnabled(false); // Will be enabled after verification
        userService.save(user);
        
        // Create intermediate token for TOTP setup
        String token = tokenService.authenticate(request.getEmail(), request.getPassword());
        
        // Set the token as an HttpOnly cookie for TOTP setup
        setCookie(response, token);
        
        // Return TOTP setup required status
        AuthenticationResponse authResponse = new AuthenticationResponse();
        authResponse.setStatus("totp_setup_required");
        authResponse.setEmail(user.getEmail());
        authResponse.setToken(token);
        authResponse.setUser(null);
        
        return ResponseEntity.ok(authResponse);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping()
    public ResponseEntity<List<UserInfoResponse>> getAllUsers() {
        List<UserInfoResponse> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PatchMapping("{id}")
    public ResponseEntity<UserInfoResponse> updateRole(@PathVariable String id, @RequestBody Map<String,String> requestBody) {
        String role = requestBody.get("role");
        UserInfoResponse response = userService.updateRole(id, role);
        return ResponseEntity.ok(response);
    }
    
    // Cookie settings - copied from TokenController
    private static final String JWT_COOKIE_NAME = "jwt_token";
    private static final int COOKIE_MAX_AGE = 30 * 60; // 30 minutes
    private static final String COOKIE_PATH = "/";

    /**
     * Helper method to set JWT cookie
     */
    private void setCookie(HttpServletResponse response, String token) {
        // Create the cookie for modern browsers
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, token);
        cookie.setHttpOnly(true);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(COOKIE_MAX_AGE);
        
        // Set Secure based on environment
        boolean isSecure = isProductionEnvironment();
        cookie.setSecure(isSecure);
        
        // Add the cookie to the response
        response.addCookie(cookie);
        
        // Also set via header to handle SameSite attribute
        String sameSitePolicy = isSecure ? "None" : "Lax";
        String cookieHeader = String.format("%s=%s; Max-Age=%d; Path=%s; HttpOnly; SameSite=%s%s", 
                JWT_COOKIE_NAME, token, COOKIE_MAX_AGE, COOKIE_PATH,
                sameSitePolicy, isSecure ? "; Secure" : "");
        
        response.setHeader("Set-Cookie", cookieHeader);
    }
    
    /**
     * Check if we're in a production environment
     */
    private boolean isProductionEnvironment() {
        // For local development environment
        return false; // Set to true for production
    }
}
