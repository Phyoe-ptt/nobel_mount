package com.college.platform.controller;

import com.college.platform.model.SocialPost;
import com.college.platform.repository.SocialPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/social-posts")
@CrossOrigin(origins = "*")
public class SocialPostController {

    @Autowired
    private SocialPostRepository socialPostRepository;

    @PostMapping
    public SocialPost createPost(@RequestBody SocialPost post) {
        post.setCreatedAt(LocalDateTime.now());
        if (post.getStatus() == null) {
            post.setStatus("DRAFT");
        }
        return socialPostRepository.save(post);
    }

    @PutMapping("/{id}/status")
    public SocialPost updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        SocialPost post = socialPostRepository.findById(id).orElseThrow();
        post.setStatus(body.get("status"));
        return socialPostRepository.save(post);
    }
    
    @PutMapping("/{id}/content")
    public SocialPost updateContent(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        SocialPost post = socialPostRepository.findById(id).orElseThrow();
        post.setContent(body.get("content"));
        return socialPostRepository.save(post);
    }
}
