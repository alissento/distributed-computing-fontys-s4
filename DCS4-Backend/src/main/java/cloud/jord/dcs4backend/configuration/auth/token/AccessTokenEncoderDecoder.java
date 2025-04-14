package cloud.jord.dcs4backend.configuration.auth.token;

import cloud.jord.dcs4backend.configuration.auth.token.exception.InvalidAccessTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class AccessTokenEncoderDecoder implements AccessTokenEncoderUseCase, AccessTokenDecoderUseCase {
    private final Key key;

    public AccessTokenEncoderDecoder(@Value("${jwt.secret}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public String encode(AccessTokenUseCase accessToken) {
        Map<String, Object> claimsMap = new HashMap<>();
        claimsMap.put("email", accessToken.getEmail());
        claimsMap.put("name", accessToken.getName());
        claimsMap.put("role", accessToken.getRole());

        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(accessToken.getUserId().toString())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(30, ChronoUnit.MINUTES)))
                .addClaims(claimsMap)
                .signWith(key)
                .compact();
    }

    @Override
    public AccessTokenUseCase decode(String accessTokenEncoded) {
        try {
            Jwt<?, Claims> jwt = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(accessTokenEncoded);
            Claims claims = jwt.getBody();

            Long userId = Long.parseLong(claims.getSubject());
            String email = claims.get("email", String.class);
            String name = claims.get("name", String.class);
            String role = claims.get("role", String.class);

            return new AccessToken(email, userId, name, role);
        } catch (JwtException e) {
            throw new InvalidAccessTokenException(e.getMessage());
        }
    }
}
