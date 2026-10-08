package com.campus.lostfound.auth.service;

import com.campus.lostfound.auth.dto.ChangePasswordRequest;
import com.campus.lostfound.auth.dto.ProfileResponse;
import com.campus.lostfound.auth.dto.UpdateProfileRequest;
import com.campus.lostfound.auth.dto.UserProfileResponse;
import com.campus.lostfound.auth.entity.User;
import com.campus.lostfound.auth.exception.BadRequestException;
import com.campus.lostfound.auth.exception.ResourceNotFoundException;
import com.campus.lostfound.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToProfile(user);
    }

    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        user.setName(request.getName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        User updatedUser = userRepository.save(user);
        return mapToProfile(updatedUser);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String currentPassword = request.getCurrentPassword() != null ? request.getCurrentPassword() : request.getOldPassword();
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<ProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfile)
                .collect(Collectors.toList());
    }

    public ProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToProfile(user);
    }

    private ProfileResponse mapToProfile(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
