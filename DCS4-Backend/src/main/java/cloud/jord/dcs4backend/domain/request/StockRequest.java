package cloud.jord.dcs4backend.domain.request;

import jakarta.validation.constraints.Max;
import lombok.Getter;
import org.hibernate.validator.constraints.Length;

import java.util.Date;

@Getter
public class StockRequest {
    @Length(min = 1, max = 5, message = "Stock symbol must be between 1 and 5 characters long.")
    private String stock_symbol;
    @Length(min = 1, max = 35, message = "Processing type must be between 1 and 35 characters long.")
    private String processing_type;
    @Length(min = 1, max = 10, message = "Jump days must be between 1 and 10.")
    private Integer jump_days;
    private Date start_date;
    private Date end_date;

    public StockRequest(String stock_symbol, String processing_type, Integer jump_days, Date start_date, Date end_date) {
        // Start date must be before end date and end date after start
        if (start_date.after(end_date)) {
            throw new IllegalArgumentException("Start date must be before end date.");
        }
        if (end_date.before(start_date)) {
            throw new IllegalArgumentException("End date must be after start date.");
        }

        // End date max 1 year
        if (end_date.getTime() - start_date.getTime() > 31536000000L) {
            throw new IllegalArgumentException("End date must be within 1 year.");
        }

        this.stock_symbol = stock_symbol;
        this.processing_type = processing_type;
        this.jump_days = jump_days;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}
