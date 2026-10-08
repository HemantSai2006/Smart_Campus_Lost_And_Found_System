package com.campus.lostfound.auth.service;

import com.campus.lostfound.auth.dto.AuthResponse;
import com.campus.lostfound.auth.dto.LoginRequest;
import com.campus.lostfound.auth.dto.LoginResponse;
import com.campus.lostfound.auth.dto.RegisterRequest;
import com.campus.lostfound.auth.entity.Role;
import com.campus.lostfound.auth.entity.User;
import com.campus.lostfound.auth.exception.BadRequestException;
import com.campus.lostfound.auth.repository.UserRepository;
import com.campus.lostfound.auth.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // New users automatically receive role = STUDENT
        Role role = Role.STUDENT;
        if (request.getRole() != null) {
            String requestedRole = request.getRole().trim().toUpperCase();
            if (requestedRole.equals("ADMIN") || requestedRole.equals("ROLE_ADMIN")) {
                role = Role.ADMIN;
            }
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setRole(role);

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole().name()
        );
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

        String token = tokenProvider.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }
}
