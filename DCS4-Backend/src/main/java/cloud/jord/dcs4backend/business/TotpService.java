package cloud.jord.dcs4backend.business;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class TotpService implements TotpServiceUseCase {
    
    private final GoogleAuthenticator googleAuthenticator;
    
    @Value("${app.name:DCS4}")
    private String appName;
    
    public TotpService() {
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    @Override
    public String generateSecret() {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    @Override
    public String generateQrCodeDataUrl(String email, String secret) {
        try {
            // Manually create the TOTP URI according to Google Authenticator format
            String totpUri = String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
                URLEncoder.encode(appName, StandardCharsets.UTF_8),
                URLEncoder.encode(email, StandardCharsets.UTF_8),
                secret,
                URLEncoder.encode(appName, StandardCharsets.UTF_8)
            );

            // Generate QR code
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(totpUri, BarcodeFormat.QR_CODE, 300, 300);
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            
            byte[] qrCodeBytes = outputStream.toByteArray();
            String base64QrCode = Base64.getEncoder().encodeToString(qrCodeBytes);
            
            return "data:image/png;base64," + base64QrCode;
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    @Override
    public boolean verifyCode(String secret, String code) {
        try {
            int numericCode = Integer.parseInt(code);
            return googleAuthenticator.authorize(secret, numericCode);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Override
    public String formatSecretForManualEntry(String secret) {
        // Format in groups of 4 for easier manual entry
        StringBuilder formatted = new StringBuilder();
        for (int i = 0; i < secret.length(); i += 4) {
            if (i > 0) {
                formatted.append(" ");
            }
            formatted.append(secret, i, Math.min(i + 4, secret.length()));
        }
        return formatted.toString();
    }
} 