package com.certiverify.verification.client;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FeignClientInterceptor implements RequestInterceptor {

    @Value("${verification.certificate-service.internal-key:}")
    private String internalApiKey;

    @Override
    public void apply(RequestTemplate template) {
        if (internalApiKey != null && !internalApiKey.isEmpty()) {
            template.header("X-Internal-Service-Key", internalApiKey);
        }
    }
}
