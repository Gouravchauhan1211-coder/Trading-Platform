package com.trading.report_service.mapper;

import com.trading.report_service.dto.ReportDTO;
import com.trading.report_service.model.Report;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReportMapper {

    @Mapping(target = "downloadUrl", ignore = true)
    ReportDTO toDTO(Report report);

    List<ReportDTO> toDTOList(List<Report> reports);
}

