package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;
import cloud.jord.dcs4backend.domain.response.UserInfoResponse;

import java.util.List;

public interface UserServiceUseCase {
    void create(UserCreateRequest request);
    User getUser(String email);
    User getUser(Long id);
    List<UserInfoResponse> getAllUsers();
    UserInfoResponse updateRole(String id, String role);
}
