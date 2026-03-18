package com.trading.notification_service.dto;

import com.trading.notification_service.model.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to update mute settings for a notification type.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MuteTypeRequest {

    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    @NotNull(message = "Mute flag is required")
    private Boolean mute;
}

