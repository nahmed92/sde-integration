/*
 * #region
 * inference-engine-core
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

package com.etilize.automation.sdeintegration.core.config.properties;

import org.hibernate.validator.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Settings for sde-intergation service
 *
 * @author Faisal Feroz
 *
 */
@Component
@ConfigurationProperties("sde-integration")
public class Settings {

    private static final long DEFAULT_ASYNC_TIMEOUT = 15 * 1000L;

    private static final int DEFAULT_CONCURRENCY_LIMIT = 20;

    @NotEmpty
    private String extractionServiceUrl;

    @NotEmpty
    private String standardizationServiceUrl;

    /**
     * Async timeout in milliseconds
     */
    private long asyncTimeout = DEFAULT_ASYNC_TIMEOUT;

    /**
     * number of concurrent mapping requests to run in parallel
     */
    private int standardizationConcurrencyLimit = DEFAULT_CONCURRENCY_LIMIT;

    public String getExtractionServiceUrl() {
        return extractionServiceUrl;
    }

    public void setExtractionServiceUrl(String extractionServiceUrl) {
        this.extractionServiceUrl = extractionServiceUrl;
    }

    public String getStandardizationServiceUrl() {
        return standardizationServiceUrl;
    }

    public void setStandardizationServiceUrl(String standardizationServiceUrl) {
        this.standardizationServiceUrl = standardizationServiceUrl;
    }

    public long getAsyncTimeout() {
        return asyncTimeout;
    }

    public void setAsyncTimeout(long asyncTimeout) {
        this.asyncTimeout = asyncTimeout;
    }

    public int getStandardizationConcurrencyLimit() {
        return standardizationConcurrencyLimit;
    }

    public void setStandardizationConcurrencyLimit(int standardizationConcurrencyLimit) {
        this.standardizationConcurrencyLimit = standardizationConcurrencyLimit;
    }

}
