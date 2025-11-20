// src/main/java/com/cakedaddy/repository/OrderRepository.java
package com.cakedaddy.repository;

import com.cakedaddy.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
    List<Order> findByStatus(String status);
}
