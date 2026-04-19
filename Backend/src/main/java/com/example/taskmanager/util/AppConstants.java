package com.example.taskmanager.util;

public final class AppConstants {

    private AppConstants() {}

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_USER  = "ROLE_USER";

    public static final String API_AUTH        = "/api/auth/**";
    public static final String API_TASKS       = "/api/tasks/**";
    public static final String API_ADMIN       = "/api/admin/**";
    public static final String API_SUGGESTIONS = "/api/suggestions/**";
    public static final String COOKIE_NAME     = "jwt";
}
