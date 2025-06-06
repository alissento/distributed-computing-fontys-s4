package cloud.jord.dcs4backend.business;

import org.springframework.security.crypto.bcrypt.BCrypt;

public final class PasswordManager {
    public static String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean passwordIsInvalid(String password, String hash) {
        return !BCrypt.checkpw(password, hash);
    }
}