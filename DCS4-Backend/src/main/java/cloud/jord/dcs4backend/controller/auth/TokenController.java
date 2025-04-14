package cloud.jord.dcs4backend.controller.auth;

import cloud.jord.dcs4backend.business.TokenServiceUseCase;
import cloud.jord.dcs4backend.domain.request.TokenRequest;
import cloud.jord.dcs4backend.domain.response.TokenResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/auth/tokens")
public class TokenController {
    private final TokenServiceUseCase tokenService;

    @PostMapping
    public ResponseEntity<TokenResponse> create(@RequestBody TokenRequest request) {
        String token = tokenService.authenticate(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(new TokenResponse(token));
    }
}
