package com.campus.lostfound.auth.config;

import com.campus.lostfound.auth.entity.Role;
import com.campus.lostfound.auth.entity.User;
import com.campus.lostfound.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Development & Demo Data Initializer
 * Seeds default administrator and demo student accounts for testing and viva demonstration.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // [DEMO DATA] Seed Default Admin Account specified in requirements: admin@smartcampus.com
        if (!userRepository.existsByEmail("admin@smartcampus.com")) {
            User admin = new User();
            admin.setName("SmartCampus Administrator");
            admin.setEmail("admin@smartcampus.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("9876543200");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.info("[DEMO DATA] Seeded Admin account: admin@smartcampus.com / Admin@123");
        }

        // [DEMO DATA] Also support legacy admin: admin@campus.edu
        if (!userRepository.existsByEmail("admin@campus.edu")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@campus.edu");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("9876543210");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        // [DEMO DATA] Seed Sample Students for testing and viva demonstration
        if (!userRepository.existsByEmail("rahul@campus.edu")) {
            User student1 = new User();
            student1.setName("Rahul Sharma");
            student1.setEmail("rahul@campus.edu");
            student1.setPassword(passwordEncoder.encode("Student@123"));
            student1.setPhone("9876543211");
            student1.setRole(Role.STUDENT);
            userRepository.save(student1);
        }

        if (!userRepository.existsByEmail("priya@campus.edu")) {
            User student2 = new User();
            student2.setName("Priya Patel");
            student2.setEmail("priya@campus.edu");
            student2.setPassword(passwordEncoder.encode("Student@123"));
            student2.setPhone("9876543212");
            student2.setRole(Role.STUDENT);
            userRepository.save(student2);
        }

        if (!userRepository.existsByEmail("amit@campus.edu")) {
            User student3 = new User();
            student3.setName("Amit Verma");
            student3.setEmail("amit@campus.edu");
            student3.setPassword(passwordEncoder.encode("Student@123"));
            student3.setPhone("9876543213");
            student3.setRole(Role.STUDENT);
            userRepository.save(student3);
        }
    }
}