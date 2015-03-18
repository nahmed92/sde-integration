/*
 * #region
 * sde-integration-core
 * %%
 * Copyright (C) 2013 - 2015 Etilize
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

package com.etilize.automation.sdeintegration.core.extract;

import java.util.List;

import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Extraction Request sent to the API.
 *
 * @author Faisal Feroz
 *
 */
public class ExtractionRequest {

    private final int productId;

    private final String text;

    private final String category;

    private final List<String> headers;

    /**
     * Constructor for {@link ExtractionRequest}
     *
     * @param productId must not be {@literal null}
     * @param text must not be {@literal null}
     * @param category must not be {@literal null}
     * @param headers must not be {@literal null}
     */
    @JsonCreator
    public ExtractionRequest(@JsonProperty("productId") final int productId,
            @JsonProperty("text") final String text,
            @JsonProperty("category") final String category,
            @JsonProperty("headers") final List<String> headers) {
        Assert.notNull(productId, "ProductId is Required");
        Assert.hasText(text, "Text must contain atleast one non-space character");
        Assert.hasText(category, "Category is required");
        Assert.notEmpty(headers, "Atleast one header is required");

        this.productId = productId;
        this.text = text;
        this.category = category;
        this.headers = headers;
    }

    public int getProductId() {
        return productId;
    }

    public String getText() {
        return text;
    }

    public String getCategory() {
        return category;
    }

    public List<String> getHeaders() {
        return headers;
    }

    /**
     * Helper method to convert to
     * {@link com.etilize.automation.ruta.client.ExtractionRequest}
     *
     * @return
     */
    public com.etilize.automation.ruta.client.ExtractionRequest toExtractionRequest() {
        final com.etilize.automation.ruta.client.ExtractionRequest request = new com.etilize.automation.ruta.client.ExtractionRequest(
                text, category, headers.toArray(new String[0]));
        return request;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this) //
        .append("Product", productId) //
        .append("Category", category) //
        .append("Headers", headers) //
        .append("Text", StringUtils.abbreviate(text, 25)) // NOSONAR
        .toString();
    }

}
