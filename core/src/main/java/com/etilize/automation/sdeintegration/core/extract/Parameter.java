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
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.annotation.PersistenceConstructor;

import com.etilize.automation.ruta.client.ExtractionParameter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 *
 * @author Aqeela Hemani
 *
 */
public class Parameter {

    private final Integer paramId;

    private final String value;

    @JsonInclude(Include.NON_EMPTY)
    private final String unit;

    @JsonInclude(Include.NON_EMPTY)
    private Standardization standardization;

    @JsonInclude(Include.NON_EMPTY)
    private StandardizedParameter export;

    @PersistenceConstructor
    public Parameter(final String value, final String unit, final Integer paramId) {
        this.value = value;
        this.unit = unit;
        this.paramId = paramId;
    }

    /**
     * Copy constructor to create an instance of {@link Parameter} from
     * {@link ExtractionParameter}
     *
     * @param parameter must not be {@literal null}
     */
    public Parameter(final ExtractionParameter parameter) {
        this.paramId = parameter.getId();
        this.value = parameter.getValue();
        this.unit = parameter.getUnit();
    }

    public String getValue() {
        return value;
    }

    public String getUnit() {
        return unit;
    }

    public Integer getParamId() {
        return paramId;
    }

    public Standardization getStandardization() {
        return standardization;
    }

    public void setStandardization(final Standardization standardization) {
        this.standardization = standardization;
    }

    public StandardizedParameter getExport() {
        return export;
    }

    public void setExport(final StandardizedParameter export) {
        this.export = export;
    }

    /**
     * Returns the Standardized Unit.
     *
     * @return
     */
    @JsonIgnore
    public String getStandardizedUnit() {
        String standardizedUnit = unit;

        if (!StringUtils.isEmpty(unit) && standardization != null
                && standardization.isFound()) {
            standardizedUnit = standardization.getStandardization();
        }

        return standardizedUnit;
    }

    /**
     * Returns the Standardized Value
     *
     * @return
     */
    @JsonIgnore
    public String getStandardizedValue() {
        String standardizedValue = value;

        if (StringUtils.isEmpty(unit) && standardization != null
                && standardization.isFound()) {
            standardizedValue = standardization.getStandardization();
        }

        return standardizedValue;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this) //
        .append("Id", paramId) //
        .append("Value", value) //
        .append("Unit", unit) //
        .append("Standardization", standardization) //
        .append("Export", export) //
        .toString();
    }

    @Override
    public final int hashCode() {
        return new HashCodeBuilder() //
        .append(paramId) //
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
        if (!(obj instanceof Parameter)) {
            return false;
        }
        final Parameter parameter = (Parameter) obj;

        return new EqualsBuilder() //
        .append(parameter.getParamId(), this.getParamId()) //
        .append(parameter.getValue(), this.getValue()) //
        .append(parameter.getUnit(), this.getUnit()) //
        .isEquals();
    }
}
