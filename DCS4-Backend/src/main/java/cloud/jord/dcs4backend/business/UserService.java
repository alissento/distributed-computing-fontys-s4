package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.Role;
import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.exceptions.ResourceNotFoundException;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;
import cloud.jord.dcs4backend.domain.response.UserInfoResponse;
import cloud.jord.dcs4backend.persistence.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class UserService implements UserServiceUseCase {
    private final UserRepository userRepository;

    @Override
    public void create(UserCreateRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.USER;

        String hashedPassword = PasswordManager.hashPassword(request.getPassword());
        User user = new User(request.getName(), request.getEmail(), hashedPassword, role);
        userRepository.save(user);
    }

    @Override
    public User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User", "email"));
    }

    @Override
    public User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id"));
    }

    @Override
    public List<UserInfoResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserInfoResponse(user.getId().toString(), user.getEmail(), user.getName(), user.getRole().name()))
                .toList();
    }

    @Override
    public UserInfoResponse updateRole(String id, String role) {
        User user = userRepository.findById(Long.parseLong(id)).orElseThrow(() -> new ResourceNotFoundException("User", "id"));
        user.setRole(Role.valueOf(role));
        userRepository.save(user);
        return new UserInfoResponse(user.getId().toString(), user.getEmail(), user.getName(), user.getRole().name());
    }
}
