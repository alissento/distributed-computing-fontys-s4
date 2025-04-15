package cloud.jord.dcs4backend.domain.exceptions;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceType;
    private final Object indentifier;

    public ResourceNotFoundException(String resourceType, Object indentifier) {
        super(String.format("%s with identifier %s not found",
                resourceType, indentifier != null ? indentifier.toString() : "null"));
        this.resourceType = resourceType;
        this.indentifier = indentifier;
    }
}
