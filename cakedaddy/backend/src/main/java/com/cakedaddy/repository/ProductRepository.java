// src/main/java/com/cakedaddy/repository/ProductRepository.java
package com.cakedaddy.repository;

import com.cakedaddy.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategory(String category);
    List<Product> findByNameContainingIgnoreCase(String name);
    
    @Query("{'price': {$gte: ?0, $lte: ?1}}")
    List<Product> findByPriceRange(Double minPrice, Double maxPrice);
}
