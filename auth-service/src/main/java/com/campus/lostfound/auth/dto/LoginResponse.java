package com.campus.lostfound.auth.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private Long id; // alias for userId
    private String name;
    private String email;
    private String phone;
    private String role;

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String name, String email, String phone, String role) {
        this.token = token;
        this.userId = userId;
        this.id = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) {
        this.userId = userId;
        this.id = userId;
    }

    public Long getId() { return id; }
    public void setId(Long id) {
        this.id = id;
        this.userId = id;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
