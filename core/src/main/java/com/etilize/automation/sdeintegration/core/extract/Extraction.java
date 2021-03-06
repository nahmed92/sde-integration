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

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.bson.types.ObjectId;
import org.joda.time.DateTime;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.etilize.commons.mongo.AbstractMongoEntity;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Domain object for Extraction
 *
 * @author Faisal Feroz
 *
 */
@Document
public class Extraction extends AbstractMongoEntity<ObjectId> {

    private static final long serialVersionUID = -5697261697275007175L;

    @Indexed
    private final String productId;

    private final String categoryId;

    private final String text;

    private DateTime createdAt;

    private List<Parameter> parameters = new ArrayList<>();

    /**
     * Constructor
     *
     * @param productId product id
     * @param categoryId category id
     * @param text text to do extraction from
     */
    @JsonCreator
    public Extraction(@JsonProperty("productId") final String productId,
            @JsonProperty("categoryId") final String categoryId,
            @JsonProperty("text") final String text) {
        this.productId = productId;
        this.categoryId = categoryId;
        this.text = text;
    }

    public String getProductId() {
        return productId;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public String getText() {
        return text;
    }

    public DateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(final DateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Parameter> getParameters() {
        return parameters;
    }

    public void setParameters(final List<Parameter> parameters) {
        this.parameters = parameters;
    }

    /**
     * Adds a Parameter
     *
     * @param parameter the {@link Parameter} to add
     */
    public void addParameter(final Parameter parameter) {
        synchronized (parameters) {
            this.parameters.add(parameter);
        }
    }

    @Override
    public final boolean equals(final Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof Extraction)) {
            return false;
        }
        final Extraction extraction = (Extraction) obj;

        return new EqualsBuilder() //
        .append(extraction.getId(), this.getId()).isEquals();
    }

    @Override
    public final int hashCode() {
        return new HashCodeBuilder() //
        .append(getId()) //
        .toHashCode();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this) //
        .append("ProductId", productId) //
        .append("CategoryId", categoryId) //
        .append("CreatedAt", createdAt) //
        .append("Text", StringUtils.abbreviate(text, 25)) // NOSONAR
        .toString();
    }
}
