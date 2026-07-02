package com.college.platform.controller;

import com.college.platform.model.CoursePackage;
import com.college.platform.repository.CoursePackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
public class CoursePackageController {

    @Autowired
    private CoursePackageRepository packageRepository;

    @GetMapping
    public List<CoursePackage> getAllPackages() {
        return packageRepository.findAll();
    }

    @PostMapping
    public CoursePackage createPackage(@RequestBody CoursePackage coursePackage) {
        if (coursePackage.getStatus() == null) {
            coursePackage.setStatus("Active");
        }
        return packageRepository.save(coursePackage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoursePackage> updatePackage(@PathVariable Long id, @RequestBody CoursePackage coursePackageDetails) {
        return packageRepository.findById(id).map(existing -> {
            existing.setName(coursePackageDetails.getName());
            existing.setSlug(coursePackageDetails.getSlug());
            existing.setPrice(coursePackageDetails.getPrice());
            existing.setStatus(coursePackageDetails.getStatus());
            return ResponseEntity.ok(packageRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        return packageRepository.findById(id).map(existing -> {
            packageRepository.delete(existing);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
