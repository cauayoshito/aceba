package com.orderflowapi.entity;

/**
 * Enum listing possible states for an Order.  New values can be added in the
 * future to support additional business states such as RETURNED or REFUNDED.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELED
}