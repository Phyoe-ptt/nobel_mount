package com.college.platform.repository;

import com.college.platform.model.CoursePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CoursePackageRepository extends JpaRepository<CoursePackage, Long> {
}
