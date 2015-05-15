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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.bson.types.ObjectId;
import org.junit.Test;
import org.springframework.http.MediaType;

import com.etilize.automation.sdeintegration.core.test.base.AbstractMongoIntegrationTest;
import com.lordofthejars.nosqlunit.annotation.UsingDataSet;
import com.lordofthejars.nosqlunit.core.LoadStrategyEnum;

@UsingDataSet(locations = { "../extractionData.bson" }, loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
public class ExtractionRepositoryRestIntegrationTest extends AbstractMongoIntegrationTest {

    @Test
    public void shouldFindAllByCreatedAtIsGreaterThanEqualWithReportProjection()
            throws Exception {
        mockMvc.perform(
                get("/extractions/search/findAllByCreatedAtIsGreaterThanEqual?createdAt={createdAt}&projection=report",
                        "2010-03-18T00:00:00.000-05:00")) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(1))) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[*]", hasSize(4))) //
        .andExpect(
                jsonPath("$._embedded.extractions[*].parameters[*].paramId",
                        containsInAnyOrder(2230387, 2230522, 2229779, 2230349))) //
        .andExpect(
                jsonPath("$._embedded.extractions[*].parameters[*].value",
                        containsInAnyOrder("Core i3", "i5-4300M", "2.6", "Intel"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[*].parameters[*].unit",
                        containsInAnyOrder("GHz")));
    }

    @Test
    public void shouldFIndAll() throws Exception {
        mockMvc.perform(get("/extractions")) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(2)));
    }

    @Test
    public void shouldnotDeleteExtractions() throws Exception {
        mockMvc.perform(
                delete("/extractions/{id}", new ObjectId("55095aab3aca9ace762ad5f9"))) //
        .andExpect(status().isMethodNotAllowed());
    }

    @Test
    public void shouldnotCreateNewExtractionFromRestApi() throws Exception {
        mockMvc.perform(
                post("/extractions").contentType(MediaType.APPLICATION_JSON).content("{}")) //
        .andExpect(status().isMethodNotAllowed());
    }
}
