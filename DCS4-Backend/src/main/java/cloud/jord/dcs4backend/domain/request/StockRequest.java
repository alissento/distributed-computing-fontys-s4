package cloud.jord.dcs4backend.domain.request;

import java.util.Date;

public class StockRequest {
    private String stock_symbol;
    private String processing_type;
    private Integer jump_days;
    private Date start_date;
    private Date end_date;
}
