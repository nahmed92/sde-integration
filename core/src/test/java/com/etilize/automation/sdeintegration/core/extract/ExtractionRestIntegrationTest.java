/*
 * #region
 * core
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

package com.etilize.automation.sdeintegration.core.extract;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.bson.types.ObjectId;
import org.junit.Test;
import org.springframework.http.MediaType;

import com.etilize.automation.sdeintegration.core.test.base.AbstractMongoIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lordofthejars.nosqlunit.annotation.UsingDataSet;

@UsingDataSet(locations = "extractionData.bson")
public class ExtractionRestIntegrationTest extends AbstractMongoIntegrationTest {

    @Test
    public void shouldFindAllExtractions() throws Exception {
        mockMvc.perform(get("/extractions")) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(2))) //
        .andExpect(jsonPath("$.page.totalElements", is(2)));
    }

    @Test
    public void shouldRenderExtractionData() throws Exception {
        mockMvc.perform(
                get("/extractions/{id}", new ObjectId("55095aab3aca9ace762ad5f9"))) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$.productId", is("1"))) //
        .andExpect(jsonPath("$.categoryId", is("4876"))) //
        .andExpect(
                jsonPath("$.text", is("Product Line: Intel Core i3 i3-4300M (2.6GHz)"))) //
        .andExpect(jsonPath("$.parameters[*]", hasSize(4)));
    }

    @Test
    public void shouldFindAllByCreatedAtIsGreaterThanEqual() throws Exception {
        mockMvc.perform(
                get("/extractions/search/findAllByCreatedAtIsGreaterThanEqual?createdAt={createdAt}",
                        "2014-03-17T00:00:00.000-05:00")) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(1))) //
        .andExpect(jsonPath("$.page.totalElements", is(1)));
    }

    @Test
    public void shouldnotCreateNewExtraction() throws Exception {
        final Extraction product = new Extraction("1", "4876", "Core i3");
        final ObjectMapper mapper = new ObjectMapper();

        mockMvc.perform(post("/extractions") //
        .contentType(MediaType.APPLICATION_JSON) //
        .content(mapper.writeValueAsString(product))) //
        .andExpect(status().isMethodNotAllowed());
    }

    @Test
    public void shouldnotDeleteExtraction() throws Exception {
        mockMvc.perform(
                delete("/extractions/{id}", new ObjectId("55095aab3aca9ace762ad5f9"))) //
        .andExpect(status().isMethodNotAllowed());
    }

    @Test
    public void shouldFindAllByProductIdSortByAscCreatedDate() throws Exception {
        mockMvc.perform(
                get("/extractions/search/findAllByProductId?productId={productId}&projection=extractedParameters&sort=createdAt,asc",
                        1)) //
        .andExpect(status().isOk()) // .
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(2))) //
        .andExpect(jsonPath("$._embedded.extractions[0].text").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].categoryId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].productId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[*]", hasSize(4))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[0].paramId",
                        is("2230091"))) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[0].value", is("ROHS"))) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[0].unit", is("g"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[0].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[1].paramId",
                        is("2230090"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[1].value",
                        is("Green Compliance"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[1].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[2].paramId",
                        is("2230091"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[2].value",
                        is("Energy Star"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[2].standardization.standardization").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].text").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].categoryId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].productId").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[0].paramId",
                        is("2230387"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[0].value", is("Core i3"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[0].standardization.status").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[1].paramId",
                        is("2230522"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[1].value", is("i3-4300M"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[1].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[2].paramId",
                        is("2229779"))) //
        .andExpect(jsonPath("$._embedded.extractions[1].parameters[2].value", is("2.6"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[2].standardization.standardization").doesNotExist());

    }

    @Test
    public void shouldFindAllByProductIdSortByDescCreatedDate() throws Exception {
        mockMvc.perform(
                get("/extractions/search/findAllByProductId?productId={productId}&projection=extractedParameters&sort=createdAt,desc",
                        1)) //
        .andExpect(status().isOk()) //
        .andExpect(jsonPath("$._embedded.extractions[*]", hasSize(2))) //
        .andExpect(jsonPath("$._embedded.extractions[0].text").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].categoryId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].productId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[*]", hasSize(4))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[0].paramId",
                        is("2230387"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[0].value", is("Core i3"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[0].standardization.status").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[1].paramId",
                        is("2230522"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[1].value", is("i3-4300M"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[1].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[0].parameters[2].paramId",
                        is("2229779"))) //
        .andExpect(jsonPath("$._embedded.extractions[0].parameters[2].value", is("2.6"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[0].parameters[2].standardization.standardization").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].text").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].categoryId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].productId").doesNotExist()) //
        .andExpect(jsonPath("$._embedded.extractions[1].parameters[*]", hasSize(4))) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[0].paramId",
                        is("2230091"))) //
        .andExpect(jsonPath("$._embedded.extractions[1].parameters[0].value", is("ROHS"))) //
        .andExpect(jsonPath("$._embedded.extractions[1].parameters[0].unit", is("g"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[0].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[1].paramId",
                        is("2230090"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[1].value",
                        is("Green Compliance"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[1].standardization.standardization").doesNotExist()) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[2].paramId",
                        is("2230091"))) //
        .andExpect(
                jsonPath("$._embedded.extractions[1].parameters[2].value",
                        is("Energy Star"))) //
        .andExpect(
                jsonPath(
                        "$._embedded.extractions[1].parameters[2].standardization.standardization").doesNotExist());

    }
}
