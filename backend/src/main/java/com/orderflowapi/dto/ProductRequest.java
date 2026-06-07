package com.orderflowapi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Data transfer object used when creating or updating a product.  Enforces
 * validation constraints for the product name and price.  The description is
 * optional.
 */
public class ProductRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    @PositiveOrZero
    private Double price;

    public ProductRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}