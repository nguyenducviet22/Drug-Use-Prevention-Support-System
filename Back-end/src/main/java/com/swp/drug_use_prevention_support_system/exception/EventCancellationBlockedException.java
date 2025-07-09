package com.swp.drug_use_prevention_support_system.exception;

public class EventCancellationBlockedException extends RuntimeException {
    public EventCancellationBlockedException(String message) {
        super(message);
    }
}