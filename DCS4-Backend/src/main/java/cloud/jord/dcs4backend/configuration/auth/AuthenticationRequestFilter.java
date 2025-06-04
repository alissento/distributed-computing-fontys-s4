package cloud.jord.dcs4backend.configuration.auth;

import cloud.jord.dcs4backend.business.UserService;
import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenDecoderUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.AccessTokenUseCase;
import cloud.jord.dcs4backend.configuration.auth.token.exception.InvalidAccessTokenException;
import cloud.jord.dcs4backend.domain.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Component
public class AuthenticationRequestFilter extends OncePerRequestFilter {

    private static final String SPRING_SECURITY_ROLE_PREFIX = "ROLE_";
    private static final String JWT_COOKIE_NAME = "jwt_token";

    private AccessTokenDecoderUseCase accessTokenDecoder;
    private UserServiceUseCase userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Skip authentication for /health endpoint
        if (request.getRequestURI().equals("/health")) {
            chain.doFilter(request, response);
            return;
        }

        // Get token from cookie
        String accessTokenString = extractTokenFromCookies(request);
        
        // Fallback to Authorization header if no cookie (for backward compatibility)
        if (accessTokenString == null) {
            accessTokenString = extractTokenFromHeader(request);
        }
        
        // If no token found, continue filter chain
        if (accessTokenString == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            AccessTokenUseCase accessToken = accessTokenDecoder.decode(accessTokenString);
            setupSpringSecurityContext(accessToken);
            chain.doFilter(request, response);
        } catch (InvalidAccessTokenException e) {
            logger.error("Error validating access token", e);
            sendAuthenticationError(response);
        }
    }
    
    /**
     * Extract JWT token from cookies
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
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromHeader(HttpServletRequest request) {
        final String requestTokenHeader = request.getHeader("Authorization");
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            return requestTokenHeader.substring(7);
        }
        return null;
    }

    private void sendAuthenticationError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.flushBuffer();
    }

    private void setupSpringSecurityContext(AccessTokenUseCase accessToken) {
        // Fetch user roles and permissions from the database
        User user = userService.getUser(accessToken.getUserId());

        // Convert roles and permissions to SimpleGrantedAuthority objects
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(SPRING_SECURITY_ROLE_PREFIX + user.getRole().name()));

        // Create UserDetails with the authorities
        UserDetails userDetails = new CustomUserDetails(
            accessToken.getUserId(), 
            accessToken.getName() != null ? accessToken.getName() : user.getName(),
            accessToken.getEmail(),
            authorities
        );

        // Set up UsernamePasswordAuthenticationToken
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        usernamePasswordAuthenticationToken.setDetails(accessToken);

        // Set the SecurityContext with the authentication token
        SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
    }
}