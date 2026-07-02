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

    @PutMapping("/lead-status/{id}")
    public ResponseEntity<FacebookMessage> updateLeadStatus(@PathVariable java.util.UUID id, @RequestBody java.util.Map<String, String> body) {
        return facebookMessageRepository.findById(id).map(msg -> {
            msg.setLeadStatus(body.get("status"));
            return ResponseEntity.ok(facebookMessageRepository.save(msg));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/payment/{id}")
    public ResponseEntity<FacebookMessage> verifyPayment(@PathVariable java.util.UUID id, @RequestBody java.util.Map<String, Object> body) {
        return facebookMessageRepository.findById(id).map(msg -> {
            if (body.containsKey("verified")) {
                msg.setPaymentVerified((Boolean) body.get("verified"));
            }
            return ResponseEntity.ok(facebookMessageRepository.save(msg));
        }).orElse(ResponseEntity.notFound().build());
    }
}
