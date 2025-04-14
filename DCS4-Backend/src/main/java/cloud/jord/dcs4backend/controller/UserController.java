package cloud.jord.dcs4backend.controller;

import cloud.jord.dcs4backend.business.UserServiceUseCase;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@AllArgsConstructor
public class UserController {
    UserServiceUseCase userService;

    @PostMapping()
    public ResponseEntity<Void> create(@RequestBody UserCreateRequest request) {
        userService.create(request);
        return ResponseEntity.ok().build();
    }
}
