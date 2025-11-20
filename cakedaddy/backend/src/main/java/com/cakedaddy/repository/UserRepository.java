// src/main/java/com/cakedaddy/repository/UserRepository.java
package com.cakedaddy.repository;

import com.cakedaddy.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Boolean existsByEmail(String email);
}
