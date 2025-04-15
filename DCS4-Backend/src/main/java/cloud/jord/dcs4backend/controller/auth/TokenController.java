package cloud.jord.dcs4backend.controller.auth;

import cloud.jord.dcs4backend.business.TokenServiceUseCase;
import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.request.TokenRequest;
import cloud.jord.dcs4backend.domain.response.TokenResponse;
import cloud.jord.dcs4backend.domain.response.UserInfoResponse;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@AllArgsConstructor
@RequestMapping("/auth/tokens")
public class TokenController {
    private final TokenServiceUseCase tokenService;
    private final UserServiceUseCase userService;
    private final AccessTokenDecoderUseCase tokenDecoder;
    
    // Cookie settings
    private static final String JWT_COOKIE_NAME = "jwt_token";
    private static final int COOKIE_MAX_AGE = 30 * 60; // 30 minutes
    private static final String COOKIE_PATH = "/";

    @PostMapping
    public ResponseEntity<TokenResponse> create(@RequestBody TokenRequest request, HttpServletResponse response) {
        String token = tokenService.authenticate(request.getEmail(), request.getPassword());
        
        // Set the token as an HttpOnly cookie
        setCookie(response, token);
        
        // Decode token to get user info to return to client
        AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
        
        // Return user info AND the token in the response body
        UserInfoResponse userInfo = new UserInfoResponse(
            decodedToken.getUserId().toString(),
            decodedToken.getEmail(),
            decodedToken.getName(),
            decodedToken.getRole()
        );
        
        // Create response with both token and user info
        TokenResponse tokenResponse = new TokenResponse();
        tokenResponse.setToken(token);
        tokenResponse.setUser(userInfo);
        
        return ResponseEntity.ok(tokenResponse);
    }
    
    @DeleteMapping
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        // Extract token from cookie
        String token = extractTokenFromCookies(request);
        if (token != null) {
            // Invalidate the token in the service
            tokenService.invalidateToken(token);
        }
        
        // Clear the cookie
        clearCookie(response);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(HttpServletRequest request) {
        // Extract token from cookie
        String token = extractTokenFromCookies(request);
        if (token != null) {
            try {
                AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
                Long userId = decodedToken.getUserId();

                // Refresh user info
                User currentUser = userService.getUser(userId);
                UserInfoResponse userInfo = new UserInfoResponse(
                        currentUser.getId().toString(),
                        currentUser.getEmail(),
                        currentUser.getName(),
                        currentUser.getRole().name()
                );
                
                return ResponseEntity.ok(userInfo);
            } catch (Exception e) {
                // Token is invalid or expired
                return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
            }
        }
        
        // No token found
        return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // Extract token from cookie
        String token = extractTokenFromCookies(request);
        if (token == null) {
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }
        
        try {
            // Refresh the token
            String newToken = tokenService.refreshToken(token);
            
            // Set the new token as a cookie
            setCookie(response, newToken);
            
            // Decode token to get user info
            AccessTokenUseCase decodedToken = tokenDecoder.decode(newToken);
            UserInfoResponse userInfo = new UserInfoResponse(
                    decodedToken.getUserId().toString(),
                    decodedToken.getEmail(),
                    decodedToken.getName(),
                    decodedToken.getRole()
            );
            
            // Return both token and user info
            TokenResponse tokenResponse = new TokenResponse();
            tokenResponse.setToken(newToken);
            tokenResponse.setUser(userInfo);
            
            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            // Token is invalid or expired
            return ResponseEntity.status(HttpServletResponse.SC_UNAUTHORIZED).build();
        }
    }
    
    /**
     * Extract a token from cookies in the request
     */
    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (JWT_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    
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
     * Helper method to clear JWT cookie
     */
    private void clearCookie(HttpServletResponse response) {
        // Clear the cookie for modern browsers
        Cookie cookie = new Cookie(JWT_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setPath(COOKIE_PATH);
        cookie.setMaxAge(0);
        
        // Set Secure based on environment
        boolean isSecure = isProductionEnvironment();
        cookie.setSecure(isSecure);
        
        // Add the cookie to the response
        response.addCookie(cookie);
        
        // Also clear via header to handle SameSite attribute
        String sameSitePolicy = isSecure ? "None" : "Lax";
        String cookieHeader = String.format("%s=; Max-Age=0; Path=%s; HttpOnly; SameSite=%s%s", 
                JWT_COOKIE_NAME, COOKIE_PATH,
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
