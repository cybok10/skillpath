
package com.skillpath.repository;

import com.skillpath.model.ActivityLog;
import com.skillpath.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop10ByUserOrderByTimestampDesc(User user);
    Integer countByUser(User user);
}
