package com.campus.lostfound.auth.controller;

import com.campus.lostfound.auth.dto.ApiResponse;
import com.campus.lostfound.auth.dto.AuthResponse;
import com.campus.lostfound.auth.dto.LoginRequest;
import com.campus.lostfound.auth.dto.LoginResponse;
import com.campus.lostfound.auth.dto.RegisterRequest;
import com.campus.lostfound.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration and login")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with hashed password and default role STUDENT")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates credentials and returns a JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }
}