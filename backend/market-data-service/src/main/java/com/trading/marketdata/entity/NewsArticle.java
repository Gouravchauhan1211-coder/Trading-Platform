package com.trading.marketdata.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {
    
    private String id;
    private String title;
    private String description;
    private String tag;
    private String tagColor;
    private String source;
    private String url;
    private LocalDateTime publishedAt;
    private String symbol;
}

