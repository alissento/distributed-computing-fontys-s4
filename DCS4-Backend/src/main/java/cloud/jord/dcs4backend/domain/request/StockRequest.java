package cloud.jord.dcs4backend.domain.request;

import lombok.Getter;

import java.util.Date;

@Getter
public class StockRequest {
    private String stock_symbol;
    private String processing_type;
    private Integer jump_days;
    private Date start_date;
    private Date end_date;
}
