
package com.skillpath.repository;

import com.skillpath.model.UserSkill;
import com.skillpath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {
    List<UserSkill> findByUser(User user);
}
