package cloud.jord.dcs4backend.controller;

import cloud.jord.dcs4backend.business.TokenServiceUseCase;
import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;
import cloud.jord.dcs4backend.domain.response.TokenResponse;
import cloud.jord.dcs4backend.domain.response.UserInfoResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    private final UserServiceUseCase userService;
    private final TokenServiceUseCase tokenService;
    private final AccessTokenDecoderUseCase tokenDecoder;

    @PostMapping()
    public ResponseEntity<TokenResponse> create(@RequestBody UserCreateRequest request) {
        userService.create(request);
        String token = tokenService.authenticate(request.getEmail(), request.getPassword());
        
        // Decode token to get user info
        AccessTokenUseCase decodedToken = tokenDecoder.decode(token);
        
        // Create user info response
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
}
