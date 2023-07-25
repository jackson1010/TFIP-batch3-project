package backEnd.Project.Controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.google.api.client.auth.openidconnect.IdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;

import backEnd.Project.Jwt.JwtUtils;
import backEnd.Project.Model.Email;
import backEnd.Project.Model.LoginRequest;
import backEnd.Project.Model.SignupRequest;
import backEnd.Project.Model.User;
import backEnd.Project.Repo.ProjectRepo;
import backEnd.Project.Services.EmailServices;
import backEnd.Project.Services.ProjectServices;
import backEnd.Project.Services.UserDetailsImpl;
import backEnd.Project.response.MessageResponse;
import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    ProjectRepo projectRepo;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    ProjectServices projectServices;

    @Autowired
    EmailServices emailServices;

    @Value("${spring.data.google.client.id}")
    private String googleClientId;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String jwtToken = "Bearer " + jwtUtils.generateTokenFromEmail(loginRequest.getEmail());

        Map<String, Object> responseMap = new HashMap<>();
        try {
            User user = projectServices.getAuthenticated(loginRequest.getEmail(), loginRequest.getPassword());
            responseMap.put("Firstname", user.getFirstname());
            responseMap.put("Lastname", user.getLastname());
            responseMap.put("Id", user.getId());
            responseMap.put("Assets", user.getFunds());
            return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION, jwtToken).body(responseMap);
        } catch (IOException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }

    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest)
            throws JsonMappingException, JsonProcessingException {

        if (projectRepo.findByEmail(signUpRequest.getEmail()) != null) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Email is already in use!"));
        }

        User user = new User();
        user.setId(User.createID());
        user.setEmail(signUpRequest.getEmail());
        user.setFirstname(signUpRequest.getFirstName());
        user.setLastname(signUpRequest.getLastName());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        // create user in redis +sql & create account in sql
        try {

            projectServices.createNewUser(user);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(e.toString()));
        }

        Email email = new Email();
        if (user.getLastname().equals("undefined")) {
            email.setName(user.getFirstname());
        } else {
            email.setName(user.getLastname());
        }
        email.setToemail(user.getEmail());

        try {
            emailServices.sendSignUpMessage(email);
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("Firstname", user.getFirstname());
        responseMap.put("Lastname", user.getLastname());
        responseMap.put("Id", user.getId());
        responseMap.put("Assets", user.getFunds().toString());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
    }

    @PostMapping("/signupViaGoogle")
    public ResponseEntity<?> registerUserViaGoogle(@RequestBody Map<String, String> result)
            throws JsonMappingException, JsonProcessingException {
        String idToken = result.get("idToken");
        String email = result.get("email");
        String lastName = "";

        if (projectRepo.findByEmail(email) != null) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Email is already in use!"));
        }

        HttpTransport transport = new NetHttpTransport();
        JsonFactory jsonFactory = new JacksonFactory();

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport,
                jsonFactory)
                .setAudience(Collections.singletonList(googleClientId)).build();

        try {
            GoogleIdToken idTokenObj = verifier.verify(idToken);
            if (idTokenObj != null) {
                GoogleIdToken.Payload payload = idTokenObj.getPayload();
                lastName = (String) payload.get("name");
            } else {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Invalid Google Token"));
            }
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }

        User user = new User();
        user.setEmail(email);
        user.setId(User.createID());
        user.setLastname(Optional.ofNullable(lastName).orElse("undefined"));
        user.setFirstname("undefined");

        // create user in redis +sql & create account in sql
        try {
            projectServices.createNewUser(user);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(e.toString()));
        }
        Email Sendemail = new Email();

        if (user.getLastname().equals("undefined")) {
            Sendemail.setName(user.getFirstname());
        } else {
            Sendemail.setName(user.getLastname());
        }
        Sendemail.setToemail(user.getEmail());

        try {
            emailServices.sendSignUpMessage(Sendemail);
        } catch (MessagingException e) {
            e.printStackTrace();
        }

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("Firstname", user.getFirstname());
        responseMap.put("Lastname", user.getLastname());
        responseMap.put("Id", user.getId());
        responseMap.put("Assets", user.getFunds());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);

    }

    @PostMapping("/signinViaGoogle")
    public ResponseEntity<?> authenticateUserViaGoogle(@RequestBody Map<String, String> result) {
        String idToken = result.get("idToken");
        String email = result.get("email");
        String firstName = "";
        String lastName = "";

        HttpTransport transport = new NetHttpTransport();
        JsonFactory jsonFactory = new JacksonFactory();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport,
                jsonFactory)
                .setAudience(Collections.singletonList(googleClientId)).build();
        try {
            GoogleIdToken idTokenObj = verifier.verify(idToken);
            if (idTokenObj != null) {
                GoogleIdToken.Payload payload = idTokenObj.getPayload();
                lastName = (String) payload.get("name");
            } else {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Invalid Google Token"));
            }
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }

        String jwtToken = "Bearer " + jwtUtils.generateTokenFromEmail(email);
        Map<String, Object> responseMap = new HashMap<>();
        try {
            User user = projectServices.getAuthenticated(email, null);
            user.setLastname(lastName);
            user.setFirstname(firstName);
            responseMap.put("Firstname", user.getFirstname());
            responseMap.put("Lastname", user.getLastname());
            responseMap.put("Id", user.getId());
            responseMap.put("Assets", user.getFunds());
            return ResponseEntity.ok().header(HttpHeaders.AUTHORIZATION,
                    jwtToken).body(responseMap);
        } catch (IOException e) {
            responseMap.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
        }

    }

}