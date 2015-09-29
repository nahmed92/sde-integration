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

import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.springframework.data.annotation.PersistenceConstructor;
import org.springframework.data.annotation.Transient;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Standardized Parameter value
 *
 * @author Faisal Feroz
 *
 */
public class StandardizedParameter {

    @JsonInclude(Include.NON_NULL)
    @Transient
    private final Integer parameterId;

    private final String value;

    @JsonInclude(Include.NON_EMPTY)
    private final String unit;

    @Transient
    private final boolean standardized;

    @PersistenceConstructor
    public StandardizedParameter(final String value, final String unit) {
        this(null, value, unit, false);
    }

    public StandardizedParameter(final Integer parameterId, final String value,
            final String unit, final boolean standardized) {
        this.parameterId = parameterId;
        this.value = value;
        this.unit = unit;
        this.standardized = standardized;
    }

    public Integer getParameterId() {
        return parameterId;
    }

    public String getValue() {
        return value;
    }

    public String getUnit() {
        return unit;
    }

    public boolean isStandardized() {
        return standardized;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this) //
        .append("ParameterId", parameterId) //
        .append("Value", value) //
        .append("Unit", unit) //
        .toString();
    }

    @Override
    public final int hashCode() {
        return new HashCodeBuilder() //
        .append(parameterId) //
        .append(value) //
        .append(unit) //
        .toHashCode();
    }

    @Override
    public final boolean equals(final Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof StandardizedParameter)) {
            return false;
        }
        final StandardizedParameter parameter = (StandardizedParameter) obj;

        return new EqualsBuilder() //
        .append(parameter.getParameterId(), this.getParameterId()) //
        .append(parameter.getValue(), this.getValue()) //
        .append(parameter.getUnit(), this.getUnit()) //
        .isEquals();
    }

}
