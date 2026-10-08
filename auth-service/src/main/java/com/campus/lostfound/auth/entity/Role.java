package com.campus.lostfound.auth.entity;

public enum Role {
    STUDENT,
    ADMIN;

    public static Role fromString(String val) {
        if (val == null) return STUDENT;
        String normalized = val.trim().toUpperCase();
        if (normalized.equals("ADMIN") || normalized.equals("ROLE_ADMIN")) {
            return ADMIN;
        }
        return STUDENT;
    }
}
