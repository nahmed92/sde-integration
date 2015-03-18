/*
 * #region
 * mapping-service-core
 * %%
 * Copyright (C) 2013 - 2014 Etilize
 * %%
 * NOTICE: All information contained herein is, and remains the property of ETILIZE.
 * The intellectual and technical concepts contained herein are proprietary to
 * ETILIZE and may be covered by U.S. and Foreign Patents, patents in process, and
 * are protected by trade secret or copyright law. Dissemination of this information
 * or reproduction of this material is strictly forbidden unless prior written
 * permission is obtained from ETILIZE. Access to the source code contained herein
 * is hereby forbidden to anyone except current ETILIZE employees, managers or
 * contractors who have executed Confidentiality and Non-disclosure agreements
 * explicitly covering such access.
 *
 * The copyright notice above does not evidence any actual or intended publication
 * or disclosure of this source code, which includes information that is confidential
 * and/or proprietary, and is a trade secret, of ETILIZE. ANY REPRODUCTION, MODIFICATION,
 * DISTRIBUTION, PUBLIC PERFORMANCE, OR PUBLIC DISPLAY OF OR THROUGH USE OF THIS
 * SOURCE CODE WITHOUT THE EXPRESS WRITTEN CONSENT OF ETILIZE IS STRICTLY PROHIBITED,
 * AND IN VIOLATION OF APPLICABLE LAWS AND INTERNATIONAL TREATIES. THE RECEIPT
 * OR POSSESSION OF THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR
 * IMPLY ANY RIGHTS TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO
 * MANUFACTURE, USE, OR SELL ANYTHING THAT IT MAY DESCRIBE, IN WHOLE OR IN PART.
 * #endregion
 */

package com.etilize.automation.sdeintegration.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.AsyncRestTemplate;

import com.etilize.automation.ruta.client.ExtractionServiceClient;
import com.etilize.automation.sdeintegration.core.config.properties.Settings;
import com.etilize.automation.sdeintegration.core.extract.NoopResponseErrorHandler;
import com.etilize.automation.standardization.client.StandardizationServiceClient;

@Configuration
public class CoreConfig {

    @Autowired
    private Settings settings;

    @Bean
    public ExtractionServiceClient extractionServiceClient() {
        final ExtractionServiceClient client = new ExtractionServiceClient(
                settings.getExtractionServiceUrl());
        final AsyncRestTemplate restTemplate = new AsyncRestTemplate();
        restTemplate.setErrorHandler(noopErrorHandler());

        return client;
    }

    @Bean
    public StandardizationServiceClient standardizationServiceClient() {
        // create a thread pool executor for standardization service client
        final ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(settings.getStandardizationConcurrencyLimit());
        executor.afterPropertiesSet();

        final AsyncRestTemplate restTemplate = new AsyncRestTemplate(executor);
        restTemplate.setErrorHandler(noopErrorHandler());
        final StandardizationServiceClient client = new StandardizationServiceClient(
                settings.getStandardizationServiceUrl());
        client.setRestTemplate(restTemplate);
        return client;
    }

    @Bean
    NoopResponseErrorHandler noopErrorHandler() {
        return new NoopResponseErrorHandler();
    }
}
