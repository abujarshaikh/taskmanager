package com.example.taskmanager.security;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.taskmanager.service.CustomUserDetailsService;
import com.example.taskmanager.util.AppConstants;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

	private final JWTUtil jwtUtil;
	private final CustomUserDetailsService customUserDetailsService;

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getServletPath();
		return path.equals("/api/auth/login")
				|| path.equals("/api/auth/register")
				|| path.equals("/api/auth/logout")
				|| path.equals("/api/auth/refresh")
				|| path.startsWith("/swagger-ui")
				|| path.startsWith("/v3/api-docs");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)
			throws ServletException, IOException {

		String token = null;
		if (request.getCookies() != null) {
			token = Arrays.stream(request.getCookies())
					.filter(c -> AppConstants.COOKIE_NAME.equals(c.getName()))
					.map(Cookie::getValue)
					.findFirst()
					.orElse(null);
		}

		// No token — only reject for protected routes, pass through for /me
		if (token == null) {
			filterChain.doFilter(request, response);
			return;
		}

		try {
			if (jwtUtil.isTokenValid(token)) {
				String username = jwtUtil.extractUsername(token);
				UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
				UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
						userDetails, null, userDetails.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(auth);
			} else {
				response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired or invalid");
				return;
			}
		} catch (JwtException | IllegalArgumentException e) {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
			return;
		}

		filterChain.doFilter(request, response);
	}
}
