package com.campus.lostfound.auth.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;

    public AuthResponse() {}

    public AuthResponse(String token, Long id, String name, String email, String phone, String role) {
        this.token = token;
        this.id = id;
        this.userId = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getUserId() { return userId != null ? userId : id; }
    public void setUserId(Long userId) {
        this.userId = userId;
        this.id = userId;
    }

    public Long getId() { return id != null ? id : userId; }
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
