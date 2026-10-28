package com.certiverify.auth.config;

import com.certiverify.auth.model.Role;
import com.certiverify.auth.model.User;
import com.certiverify.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.email}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password}")
    private String adminPassword;

    @Value("${app.bootstrap.admin.name}")
    private String adminName;

    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            logger.info("Bootstrap admin account not found. Creating it now...");
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setName(adminName);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            
            userRepository.save(admin);
            logger.info("Bootstrap admin account created successfully.");
        } else {
            logger.info("Bootstrap admin account already exists. Skipping creation.");
        }
    }
}
