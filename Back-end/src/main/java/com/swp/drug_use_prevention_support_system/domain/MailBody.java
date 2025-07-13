package com.swp.drug_use_prevention_support_system.domain;

import lombok.Builder;

@Builder
public record MailBody(String[] to, String subject, String content) {
}
