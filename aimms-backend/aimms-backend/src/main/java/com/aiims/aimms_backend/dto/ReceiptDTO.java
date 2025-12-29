package com.aiims.aimms_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class ReceiptDTO {
    @JsonProperty("merchant_name")
    private String merchantName;

    @JsonProperty("bill_number")
    private String billNumber;

    @JsonProperty("date")
    private String date;
    
    @JsonProperty("time")
    private String time;

    @JsonProperty("total_amount")
    private Double totalAmount;

    @JsonProperty("tax_amount")
    private Double taxAmount;
    
    @JsonProperty("items")
    private List<Object> items; // Placeholder for now

    @JsonProperty("raw_text")
    private List<String> rawText;
    
    @JsonProperty("error")
    private String error;
}
