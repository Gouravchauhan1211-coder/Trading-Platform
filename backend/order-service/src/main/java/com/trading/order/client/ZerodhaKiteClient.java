package com.trading.order.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Zerodha Kite Connect API Client
 * Documentation: https://kite.trade/docs/connect/v3/
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ZerodhaKiteClient {

    @Value("${zerodha.api.key:}")
    private String apiKey;

    @Value("${zerodha.api.secret:}")
    private String apiSecret;

    @Value("${zerodha.api.url:https://api.kite.trade}")
    private String kiteUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private String accessToken;
    private String publicToken;

    /**
     * Initialize login with API key
     */
    public String getLoginUrl() {
        return kiteUrl + "/login?api_key=" + apiKey;
    }

    /**
     * Generate session with public token received from Kite login
     */
    public Map<String, String> generateSession(String publicToken) throws Exception {
        this.publicToken = publicToken;

        String checksum = generateChecksum(apiKey + publicToken + apiSecret, apiSecret);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("api_key", apiKey);
        requestBody.put("public_token", publicToken);
        requestBody.put("checksum", checksum);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                kiteUrl + "/session/token",
                request,
                String.class
        );

        JsonNode jsonNode = objectMapper.readTree(response.getBody());
        this.accessToken = jsonNode.get("data").get("access_token").asText();

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("userId", jsonNode.get("data").get("user_id").asText());

        return result;
    }

    /**
     * Place an order
     */
    public Map<String, Object> placeOrder(String exchange, String tradingSymbol, String transactionType,
                                         String quantity, String product, String orderType) throws Exception {
        Map<String, String> orderParams = new HashMap<>();
        orderParams.put("exchange", exchange);
        orderParams.put("tradingsymbol", tradingSymbol);
        orderParams.put("transaction_type", transactionType);
        orderParams.put("quantity", quantity);
        orderParams.put("product", product);
        orderParams.put("order_type", orderType);
        orderParams.put("variety", "regular");

        String orderJson = objectMapper.writeValueAsString(orderParams);
        String checksum = generateChecksum(orderJson, accessToken + apiSecret);

        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        Map<String, String> body = new HashMap<>();
        body.put("order_params", orderJson);
        body.put("checksum", checksum);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                kiteUrl + "/orders/regular",
                request,
                String.class
        );

        return parseOrderResponse(response.getBody());
    }

    /**
     * Cancel an order
     */
    public Map<String, Object> cancelOrder(String orderId, String variety) throws Exception {
        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                kiteUrl + "/orders/" + variety + "/" + orderId,
                HttpMethod.DELETE,
                request,
                String.class
        );

        return parseOrderResponse(response.getBody());
    }

    /**
     * Get order history
     */
    public Map<String, Object> getOrderHistory(String orderId) throws Exception {
        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                kiteUrl + "/orders/" + orderId,
                HttpMethod.GET,
                request,
                String.class
        );

        return objectMapper.readValue(response.getBody(), Map.class);
    }

    /**
     * Get holdings
     */
    public Map<String, Object> getHoldings() throws Exception {
        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                kiteUrl + "/holdings",
                HttpMethod.GET,
                request,
                String.class
        );

        return objectMapper.readValue(response.getBody(), Map.class);
    }

    /**
     * Get positions
     */
    public Map<String, Object> getPositions() throws Exception {
        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                kiteUrl + "/portfolio/positions",
                HttpMethod.GET,
                request,
                String.class
        );

        return objectMapper.readValue(response.getBody(), Map.class);
    }

    /**
     * Get quote for a symbol
     */
    public Map<String, Object> getQuote(String exchange, String tradingSymbol) throws Exception {
        HttpHeaders headers = createHeaders();
        headers.set("X-Kite-Version", "3");
        headers.set("Authorization", "token " + apiKey + ":" + accessToken);

        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                kiteUrl + "/quote?i=NSE:" + tradingSymbol,
                HttpMethod.GET,
                request,
                String.class
        );

        return objectMapper.readValue(response.getBody(), Map.class);
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String generateChecksum(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hmacData = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hmacData);
    }

    private Map<String, Object> parseOrderResponse(String responseBody) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        Map<String, Object> result = new HashMap<>();

        if (jsonNode.has("data")) {
            JsonNode data = jsonNode.get("data");
            result.put("orderId", data.has("order_id") ? data.get("order_id").asText() : null);
            result.put("status", data.has("status") ? data.get("status").asText() : "success");
            result.put("message", data.has("message") ? data.get("message").asText() : "Order placed successfully");
        } else {
            result.put("status", "error");
            result.put("message", jsonNode.has("message") ? jsonNode.get("message").asText() : "Unknown error");
        }

        return result;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public boolean isConnected() {
        return accessToken != null && !accessToken.isEmpty();
    }
}

