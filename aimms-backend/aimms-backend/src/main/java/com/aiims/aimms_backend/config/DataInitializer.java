package com.aiims.aimms_backend.config;

import com.aiims.aimms_backend.model.Admin;
import com.aiims.aimms_backend.model.Role;
import com.aiims.aimms_backend.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(AdminRepository adminRepository,
            com.aiims.aimms_backend.repository.CategoryRepository categoryRepository) {
        return args -> {
            // Check if default admin exists
            if (adminRepository.findByEmail("admin@aimms.com").isEmpty()) {
                Admin admin = new Admin();
                admin.setName("Admin");
                admin.setEmail("admin@aimms.com");
                admin.setPasswordHash("admin123");
                admin.setRole(Role.ADMIN);

                adminRepository.save(admin);
                System.out.println("✅ Default admin created: admin@aimms.com / admin123");
            }

            // Seed Categories
            // Seed Categories from sample_dataset.csv
            String[] categories = { "Food & Drink", "Transport", "Subscriptions", "Groceries", "Health", "Shopping",
                    "Utilities", "Rent", "Entertainment", "Miscellaneous", "Bills", "Salary", "Investment" };
            for (String catName : categories) {
                if (categoryRepository.findByName(catName).isEmpty()) {
                    com.aiims.aimms_backend.model.Category cat = new com.aiims.aimms_backend.model.Category();
                    cat.setName(catName);
                    // cat.setType("EXPENSE"); // assuming default or mixed
                    categoryRepository.save(cat);
                    System.out.println("✅ Category created: " + catName);
                }
            }
        };
    }
}
