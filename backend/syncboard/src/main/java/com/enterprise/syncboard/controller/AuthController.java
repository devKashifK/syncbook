package com.enterprise.syncboard.controller;

import com.enterprise.syncboard.model.User;
import com.enterprise.syncboard.config.JwtUtil;
import com.enterprise.syncboard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional; 

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered!"));
        }

        User newUser = new User();
        newUser.setEmail(email);
        
        newUser.setPassword(passwordEncoder.encode(password));

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully using secure UUID!"));
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        String token = jwtUtil.generateToken(email);

        return ResponseEntity.ok(Map.of(
            "message", "Authentication successful!",
            "token", token
        ));
    }
}