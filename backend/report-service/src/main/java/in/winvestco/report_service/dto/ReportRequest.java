package com.trading.report_service.dto;

import com.trading.common.enums.ReportFormat;
import com.trading.common.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

/**
 * Request DTO for creating a new report
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    
    @NotNull(message = "Report type is required")
    private ReportType type;
    
    @NotNull(message = "Report format is required")
    private ReportFormat format;
    
    private Instant fromDate;
    
    private Instant toDate;
}

