package com.example.taskmanager.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskmanager.dto.AuthRequest;
import com.example.taskmanager.dto.AuthResponse;
import com.example.taskmanager.dto.RefreshTokenResponse;
import com.example.taskmanager.dto.RegisterRequest;
import com.example.taskmanager.dto.UpdateProfileRequest;
import com.example.taskmanager.entity.RefreshToken;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.service.AuthService;
import com.example.taskmanager.service.RefreshTokenService;
import com.example.taskmanager.service.UserProfileService;
import com.example.taskmanager.security.JWTUtil;
import com.example.taskmanager.util.AppConstants;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final UserProfileService userProfileService;
    private final JWTUtil jwtUtil;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request);

        ResponseCookie accessCookie = buildCookie(AppConstants.COOKIE_NAME, authResponse.getToken(), 86400);
        ResponseCookie refreshCookie = buildCookie(AppConstants.REFRESH_COOKIE_NAME, authResponse.getRefreshToken(), 604800);

        AuthResponse body = new AuthResponse(authResponse.getRole(), null, authResponse.getUsername(), null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(body);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(jakarta.servlet.http.HttpServletRequest request) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie c : request.getCookies()) {
                if (AppConstants.REFRESH_COOKIE_NAME.equals(c.getName())) {
                    refreshToken = c.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        RefreshToken validated = refreshTokenService.validateRefreshToken(refreshToken);
        User user = validated.getUser();
        String newAccessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        ResponseCookie accessCookie = buildCookie(AppConstants.COOKIE_NAME, newAccessToken, 86400);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .body(new RefreshTokenResponse(null, user.getRole().name(), user.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null) {
            refreshTokenService.deleteByUsername(authentication.getName());
        }
        ResponseCookie accessCookie  = buildCookie(AppConstants.COOKIE_NAME, "", 0);
        ResponseCookie refreshCookie = buildCookie(AppConstants.REFRESH_COOKIE_NAME, "", 0);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String username = authentication.getName();
        return ResponseEntity.ok(new AuthResponse(role, null, username, null));
    }

    @PatchMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        userProfileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    private ResponseCookie buildCookie(String name, String value, long maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax")
                .build();
    }
}
