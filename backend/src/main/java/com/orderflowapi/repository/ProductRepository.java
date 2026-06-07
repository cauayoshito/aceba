package com.orderflowapi.repository;

import com.orderflowapi.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * Repository for Products.  Provides a method to find a product by name.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
}