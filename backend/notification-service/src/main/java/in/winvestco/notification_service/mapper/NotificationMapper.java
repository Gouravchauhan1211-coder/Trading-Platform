package com.trading.notification_service.mapper;

import com.trading.notification_service.dto.NotificationDTO;
import com.trading.notification_service.model.Notification;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * MapStruct mapper for Notification entity.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDTO toDTO(Notification notification);
    
    List<NotificationDTO> toDTOList(List<Notification> notifications);
}

