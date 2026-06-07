package com.orderflowapi.service;

import com.orderflowapi.dto.*;
import com.orderflowapi.entity.*;
import com.orderflowapi.exception.ResourceNotFoundException;
import com.orderflowapi.repository.CustomerRepository;
import com.orderflowapi.repository.OrderRepository;
import com.orderflowapi.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer encapsulating the business logic for order management.  It
 * validates input, enforces allowed status transitions, maps entities to
 * transfer objects and coordinates persistence of orders and their items.
 */
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        CustomerRepository customerRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    /**
     * Retrieve all orders in the system.  Used by administrators to view
     * every order regardless of customer.  Results are mapped to
     * {@link OrderResponse} objects.
     */
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve all orders for a given customer.
     *
     * @param customerId identifier of the customer
     * @return list of orders belonging to the customer
     */
    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + customerId));
        return orderRepository.findByCustomer(customer).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a single order by its identifier.
     *
     * @param id the order id
     * @return order details
     */
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
        return toOrderResponse(order);
    }

    /**
     * Create a new order from the given request.  It validates that the
     * customer exists and that each referenced product exists, then
     * constructs an Order entity with associated OrderItem entities.  The
     * price of each item is captured from the product at the time of
     * ordering to guard against future price changes.
     *
     * @param request the order creation request
     * @return the created order response
     */
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Validate at least one item
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one item");
        }

        // Fetch the customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + request.getCustomerId()));

        Order order = new Order(customer);

        // Create OrderItems
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + itemReq.getProductId()));
            if (itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero for product id " + itemReq.getProductId());
            }
            OrderItem orderItem = new OrderItem(product, itemReq.getQuantity(), product.getPrice());
            order.addItem(orderItem);
        }

        order = orderRepository.save(order);
        return toOrderResponse(order);
    }

    /**
     * Update the status of an existing order.  Only allowed transitions are
     * permitted.  Attempts to transition to an invalid state will result
     * in an IllegalStateException.  Completed (DELIVERED) or CANCELED orders
     * cannot change status.
     *
     * @param id        order identifier
     * @param newStatus the desired new status
     * @return updated order response
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id " + id));
        OrderStatus current = order.getStatus();

        if (!canTransition(current, newStatus)) {
            throw new IllegalStateException("Cannot transition order " + id + " from " + current + " to " + newStatus);
        }
        order.setStatus(newStatus);
        order = orderRepository.save(order);
        return toOrderResponse(order);
    }

    /**
     * Determine whether an order can transition from the current status to a
     * desired new status.  This encapsulates business rules governing the
     * order lifecycle.  Cancelled or delivered orders cannot transition to
     * another status.
     */
    private boolean canTransition(OrderStatus current, OrderStatus target) {
        if (current == OrderStatus.CANCELED || current == OrderStatus.DELIVERED) {
            return false;
        }
        switch (current) {
            case PENDING:
                return target == OrderStatus.CONFIRMED || target == OrderStatus.CANCELED;
            case CONFIRMED:
                return target == OrderStatus.PROCESSING || target == OrderStatus.CANCELED;
            case PROCESSING:
                return target == OrderStatus.SHIPPED || target == OrderStatus.CANCELED;
            case SHIPPED:
                return target == OrderStatus.DELIVERED;
            default:
                return false;
        }
    }

    /**
     * Convert an Order entity to its response DTO representation.  It
     * aggregates the order items and computes the total value by summing
     * price multiplied by quantity for each item.
     */
    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        double total = 0.0;
        for (OrderItem item : order.getItems()) {
            double lineTotal = item.getPrice() * item.getQuantity();
            total += lineTotal;
            itemResponses.add(new OrderItemResponse(
                    item.getProduct().getId(),
                    item.getProduct().getName(),
                    item.getQuantity(),
                    item.getPrice()));
        }
        Customer customer = order.getCustomer();
        return new OrderResponse(
                order.getId(),
                order.getOrderDate(),
                order.getStatus().name(),
                customer.getId(),
                customer.getName(),
                customer.getEmail(),
                itemResponses,
                total
        );
    }
}
