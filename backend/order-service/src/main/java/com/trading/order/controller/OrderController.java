package com.trading.order.controller;

import com.trading.common.events.OrderEvent;
import com.trading.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderEvent> createOrder(@RequestBody OrderEvent order) {
        OrderEvent createdOrder = orderService.createOrder(order);
        return ResponseEntity.ok(createdOrder);
    }

    @GetMapping
    public ResponseEntity<List<OrderEvent>> getOrders() {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderEvent> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(OrderEvent.builder().orderId(id).status(OrderEvent.OrderStatus.PENDING).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelOrder(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("message", "Order cancelled", "orderId", id));
    }
    
    @GetMapping("/mode")
    public ResponseEntity<Map<String, String>> getTradingMode() {
        return ResponseEntity.ok(Map.of(
            "mode", orderService.getTradingMode()
        ));
    }
}

