package com.orderflowapi.repository;

import com.orderflowapi.entity.Order;
import com.orderflowapi.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository for Order entities.  Provides additional methods for retrieving
 * orders for a specific customer.
 */
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomer(Customer customer);
}