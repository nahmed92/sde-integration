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

package com.etilize.automation.sdeintegration.core.extract.report;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import com.etilize.automation.sdeintegration.core.extract.Parameter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

/**
 * Report projection for {@link Parameter}
 *
 * @author Faisal Feroz
 *
 */
@Projection(name = "report", types = Parameter.class)
public interface ParameterReport {

    String getParamId();

    @Value("#{target.export.value}")
    String getValue();

    @JsonInclude(Include.NON_NULL)
    @Value("#{target.export.unit}")
    String getUnit();
}
