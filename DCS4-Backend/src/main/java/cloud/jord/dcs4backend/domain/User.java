package cloud.jord.dcs4backend.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "users")
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(unique = true)
    private String email;
    private String passwordHash;
    private Role role;
    
    // TOTP 2FA fields
    private String totpSecret;
    private boolean totpEnabled = false;

    public User(String name, String email, String hashedPassword, Role role) {
        this.name = name;
        this.email = email;
        this.passwordHash = hashedPassword;
        this.role = role;
        this.totpEnabled = false;
    }
}
