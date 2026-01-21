
package com.skillpath.repository;

import com.skillpath.model.Badge;
import com.skillpath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUser(User user);
}
