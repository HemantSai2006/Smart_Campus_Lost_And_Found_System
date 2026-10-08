package com.campus.lostfound.item.config;

import com.campus.lostfound.item.entity.Item;
import com.campus.lostfound.item.entity.ItemStatus;
import com.campus.lostfound.item.entity.ItemType;
import com.campus.lostfound.item.repository.ItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ItemRepository itemRepository;

    public DataInitializer(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    public void run(String... args) {
        // Automatic demo-item insertion has been disabled to prevent sample items from populating the database.
    }
}