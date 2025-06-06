package cloud.jord.dcs4backend.controller;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health")
@AllArgsConstructor
public class HealthController {
    @GetMapping
    public ResponseEntity<Void> health() {
        return ResponseEntity.ok().build();
    }
}
