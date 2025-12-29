package com.aiims.aimms_backend.service.impl;

import com.aiims.aimms_backend.model.Category;
import com.aiims.aimms_backend.repository.CategoryRepository;
import com.aiims.aimms_backend.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
