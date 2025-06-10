package cloud.jord.dcs4backend.controller.auth;

import cloud.jord.dcs4backend.business.TotpServiceUseCase;
import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.request.TotpSetupRequest;
import cloud.jord.dcs4backend.domain.request.TotpVerificationRequest;
import cloud.jord.dcs4backend.domain.response.TotpSetupResponse;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@AllArgsConstructor
@RequestMapping("/auth/totp")
public class TotpController {
    private final TotpServiceUseCase totpService;
    private final UserServiceUseCase userService;
    private final AccessTokenDecoderUseCase tokenDecoder;
    
    private static final String JWT_COOKIE_NAME = "jwt_token";

    @PostMapping("/setup")
    public ResponseEntity<TotpSetupResponse> setupTotp(HttpServletRequest request) {
        // Extract user from token
        String token = extractTokenFromCookies(request);
        if (token == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
            User user = userService.getUser(decodedToken.getUserId());
            
            // Generate new TOTP secret
            String secret = totpService.generateSecret();
            
            // Generate QR code
            String qrCodeDataUrl = totpService.generateQrCodeDataUrl(user.getEmail(), secret);
            String manualEntryKey = totpService.formatSecretForManualEntry(secret);
            
            // Save secret to user (but don't enable TOTP yet)
            user.setTotpSecret(secret);
            user.setTotpEnabled(false);
            userService.save(user);
            
            TotpSetupResponse response = new TotpSetupResponse(secret, manualEntryKey, qrCodeDataUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/setup/verify")
    public ResponseEntity<Void> verifyTotpSetup(@RequestBody TotpSetupRequest request, HttpServletRequest httpRequest) {
        // Extract user from token
        String token = extractTokenFromCookies(httpRequest);
        if (token == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
            User user = userService.getUser(decodedToken.getUserId());
            
            // Verify the TOTP code with the provided secret
            if (totpService.verifyCode(request.getSecret(), request.getCode())) {
                // Enable TOTP for the user
                user.setTotpSecret(request.getSecret());
                user.setTotpEnabled(true);
                userService.save(user);
                
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Void> verifyTotp(@RequestBody TotpVerificationRequest request, HttpServletRequest httpRequest) {
        // This endpoint is used during login flow - implemented in TokenController
        // This is a placeholder for potential future use
        return ResponseEntity.status(501).build(); // Not implemented
    }

    @PostMapping("/disable")
    public ResponseEntity<Void> disableTotp(HttpServletRequest request) {
        // Extract user from token
        String token = extractTokenFromCookies(request);
        if (token == null) {
            return ResponseEntity.status(401).build();
        }
        
        try {
            AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
            User user = userService.getUser(decodedToken.getUserId());
            
            // Disable TOTP
            user.setTotpSecret(null);
            user.setTotpEnabled(false);
            userService.save(user);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
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
} 