package cloud.jord.dcs4backend.business;

import cloud.jord.dcs4backend.domain.User;
import cloud.jord.dcs4backend.domain.request.UserCreateRequest;

public interface UserServiceUseCase {
    void create(UserCreateRequest request);
    User getUser(String email);
    User getUser(Long id);
}
