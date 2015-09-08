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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Arrays;
import java.util.Set;

import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MvcResult;

import com.etilize.automation.sdeintegration.core.test.base.AbstractMongoIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import com.google.common.util.concurrent.SettableFuture;

@DirtiesContext
public class ExtractRestIntegrationTest extends AbstractMongoIntegrationTest {

    @Mock
    private ExtractionService service;

    @InjectMocks
    @Autowired
    private ExtractionController controller;

    @Test
    public void shouldExtractData() throws Exception {
        final SettableFuture<Set<StandardizedParameter>> future = SettableFuture.create();
        final Set<StandardizedParameter> values = Sets.newHashSet(
                new StandardizedParameter(2230387, "Core i3", null),
                new StandardizedParameter(2230387, "Core i3", null),
                new StandardizedParameter(2229779, "2.6", "GHz"));
        future.set(values);
        Mockito.when(service.extract(Mockito.any(ExtractionRequest.class))).thenReturn(
                future);

        final ObjectMapper mapper = new ObjectMapper();
        final ExtractionRequest request = new ExtractionRequest(1, "Core i3 2.6GHz",
                4876, Arrays.asList(123));

        final String content = mapper.writeValueAsString(request);
        final MvcResult mvcResult = mockMvc.perform(post("/extract") //
        .contentType(MediaType.APPLICATION_JSON) //
        .content(content)) //
        .andExpect(request().asyncStarted()) //
        .andExpect(request().asyncResult(values)) //
        .andReturn();

        this.mockMvc.perform(asyncDispatch(mvcResult)) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$[*]", hasSize(2))) //
        .andExpect(jsonPath("$[*].parameterId", contains(2230387, 2229779))) //
        .andExpect(jsonPath("$[*].value", contains("Core i3", "2.6"))) //
        .andExpect(jsonPath("$[*].unit", contains("GHz")));

    }
}
