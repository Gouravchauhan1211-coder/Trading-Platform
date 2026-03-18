package com.trading.marketdata.config;

import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

public class GzipDecompressionInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
        // Remove Accept-Encoding: br to avoid Brotli compression (not easily decompressible in Java without extra libraries)
        request.getHeaders().remove("Accept-Encoding");
        // Request gzip instead
        request.getHeaders().set("Accept-Encoding", "gzip, deflate");
        
        ClientHttpResponse response = execution.execute(request, body);
        
        // Check if response is gzip compressed
        String contentEncoding = response.getHeaders().getFirst("Content-Encoding");
        if (contentEncoding != null && contentEncoding.contains("gzip")) {
            return new GzipDecompressedResponse(response);
        }
        
        return response;
    }

    private static class GzipDecompressedResponse implements ClientHttpResponse {
        private final ClientHttpResponse originalResponse;
        private byte[] decompressedBody;

        public GzipDecompressedResponse(ClientHttpResponse originalResponse) {
            this.originalResponse = originalResponse;
        }

        @Override
        public InputStream getBody() throws IOException {
            if (decompressedBody == null) {
                try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                     GZIPInputStream gzipInputStream = new GZIPInputStream(originalResponse.getBody())) {
                    StreamUtils.copy(gzipInputStream, outputStream);
                    decompressedBody = outputStream.toByteArray();
                }
            }
            return new ByteArrayInputStream(decompressedBody);
        }

        @Override
        public org.springframework.http.HttpHeaders getHeaders() {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.putAll(originalResponse.getHeaders());
            headers.remove("Content-Encoding");
            headers.remove("Content-Length");
            return headers;
        }

        @Override
        public HttpStatusCode getStatusCode() throws IOException {
            return originalResponse.getStatusCode();
        }

        @Override
        public int getRawStatusCode() throws IOException {
            return originalResponse.getStatusCode().value();
        }

        @Override
        public String getStatusText() throws IOException {
            return originalResponse.getStatusText();
        }

        @Override
        public void close() {
            originalResponse.close();
        }
    }
}

