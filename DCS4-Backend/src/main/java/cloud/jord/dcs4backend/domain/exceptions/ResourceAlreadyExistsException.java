package cloud.jord.dcs4backend.domain.exceptions;

import lombok.Getter;

@Getter
public class ResourceAlreadyExistsException extends RuntimeException {
    private final String resourceType;
    private final Object indentifier;

    public ResourceAlreadyExistsException(String resourceType, Object indentifier) {
        super(String.format("%s with identifier %s already exists",
                resourceType, indentifier != null ? indentifier.toString() : "null"));
        this.resourceType = resourceType;
        this.indentifier = indentifier;
    }
}
