package com.college.platform.controller;

import com.college.platform.model.FacebookMessage;
import com.college.platform.repository.FacebookMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inbox")
@CrossOrigin(origins = "*")
public class InboxController {

    @Autowired
    private FacebookMessageRepository facebookMessageRepository;

    @GetMapping
    public ResponseEntity<List<FacebookMessage>> getInboxMessages() {
        List<FacebookMessage> messages = facebookMessageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<FacebookMessage> saveMessage(@RequestBody FacebookMessage message) {
        FacebookMessage savedMessage = facebookMessageRepository.save(message);
        return ResponseEntity.ok(savedMessage);
    }

    @PutMapping("/resolve/{id}")
    public ResponseEntity<FacebookMessage> resolveMessage(@PathVariable java.util.UUID id) {
        return facebookMessageRepository.findById(id).map(msg -> {
            msg.setResolved(true);
            return ResponseEntity.ok(facebookMessageRepository.save(msg));
        }).orElse(ResponseEntity.notFound().build());
    }
}
