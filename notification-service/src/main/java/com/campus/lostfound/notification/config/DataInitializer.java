package com.campus.lostfound.notification.config;

import com.campus.lostfound.notification.entity.Notification;
import com.campus.lostfound.notification.entity.NotificationType;
import com.campus.lostfound.notification.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    public DataInitializer(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        if (notificationRepository.count() == 0) {
            Notification n1 = new Notification();
            n1.setUserId(2L); // Rahul Sharma
            n1.setMessage("Welcome to Smart Campus Lost & Found! Report any lost or found items here.");
            n1.setType(NotificationType.GENERAL);
            n1.setRead(false);
            notificationRepository.save(n1);

            Notification n2 = new Notification();
            n2.setUserId(2L);
            n2.setMessage("Possible match detected for your lost 'Black HP Pavilion Laptop' in CSE Block!");
            n2.setType(NotificationType.POSSIBLE_MATCH);
            n2.setReferenceId(1L);
            n2.setRead(false);
            notificationRepository.save(n2);
        }
    }
}