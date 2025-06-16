package cloud.jord.dcs4backend.business;

public interface TotpServiceUseCase {
    /**
     * Generate a new TOTP secret
     */
    String generateSecret();
    
    /**
     * Generate QR code data URL for TOTP setup
     */
    String generateQrCodeDataUrl(String email, String secret);
    
    /**
     * Verify a TOTP code against a secret
     */
    boolean verifyCode(String secret, String code);
    
    /**
     * Format secret for manual entry (grouped by 4 characters)
     */
    String formatSecretForManualEntry(String secret);
} 