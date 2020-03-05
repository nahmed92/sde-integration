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

import static org.hamcrest.MatcherAssert.*;
import static org.hamcrest.Matchers.*;

import java.util.Date;
import java.util.List;

import org.bson.types.ObjectId;
import org.joda.time.DateTime;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;

import com.etilize.automation.sdeintegration.core.test.base.AbstractMongoIntegrationTest;
import com.lordofthejars.nosqlunit.annotation.UsingDataSet;
import com.lordofthejars.nosqlunit.core.LoadStrategyEnum;

@UsingDataSet(locations = { "extractionData.bson" }, loadStrategy = LoadStrategyEnum.CLEAN_INSERT)
public class ExtractionRepositoryIntegrationTest extends AbstractMongoIntegrationTest {

    @Autowired
    private ExtractionRepository repository;

    @Test
    public void shouldFindAllByCreatedAtIsGreaterThanEqual() throws Exception {
        final Page<Extraction> result = repository.findAllByCreatedAtIsGreaterThanEqual(
                DateTime.now().minusYears(1), new PageRequest(0, 20));

        assertThat(result, is(notNullValue()));
        assertThat(result.getTotalPages(), is(1));
        assertThat(result.getSize(), is(20));
        assertThat(result.getTotalElements(), is(1L));

        // equals check for id
        final Extraction item = new Extraction("1", "4876",
                "Product Line: Intel Core i3 i3-4300M (2.6GHz)");
        item.setId(new ObjectId("55095aab3aca9ace762ad5f9"));
        assertThat(result.getContent(), hasItem(item));
    }

    @Test
    public void shouldFindAllByProductIdSortByDescCreatedDate() throws Exception {
        final List<Extraction> result = repository.findAllByProductId("1", new Sort(
                Direction.DESC, "createdAt"));
        final Extraction item = new Extraction("1", "4876",
                "Product Line: Intel Core i3 i3-4300M (2.6GHz)");
        item.setId(new ObjectId("55095aab3aca9ace762ad5f9"));
        assertThat(result.get(0).getText(), is(item.getText()));
        assertThat(result.get(0).getProductId(), is(item.getProductId()));
        assertThat(result.get(0).getCategoryId(), is(item.getCategoryId()));
        assertThat(result.get(0).getParameters().get(0).getParamId(), is("2230387"));
        assertThat(result.get(0).getParameters().get(0).getValue(), is("Core i3"));
        assertThat(result.get(0).getParameters().get(1).getParamId(), is("2230522"));
        assertThat(result.get(0).getParameters().get(1).getValue(), is("i3-4300M"));
        assertThat(result.get(0).getParameters().get(2).getParamId(), is("2229779"));
        assertThat(result.get(0).getParameters().get(2).getValue(), is("2.6"));
        assertThat(result.get(0).getParameters().get(3).getParamId(), is("2230349"));
        assertThat(result.get(0).getParameters().get(3).getValue(), is("Intel"));

        final Extraction item2 = new Extraction("1", "4876",
                "Green Compliance Certificate/Authority: EPEAT Gold, ROHS, Energy Star 5.2");
        item2.setId(new ObjectId("53e9155b5ed24e4c38d60e3c"));
        assertThat(result.get(1).getText(), is(item2.getText()));
        assertThat(result.get(1).getProductId(), is(item2.getProductId()));
        assertThat(result.get(1).getCategoryId(), is(item2.getCategoryId()));
        assertThat(result.get(1).getText(), is(item2.getText()));
        assertThat(result.get(1).getParameters().get(0).getParamId(), is("2230091"));
        assertThat(result.get(1).getParameters().get(0).getValue(), is("ROHS"));
        assertThat(result.get(1).getParameters().get(1).getParamId(), is("2230090"));
        assertThat(result.get(1).getParameters().get(1).getValue(),
                is("Green Compliance"));
        assertThat(result.get(1).getParameters().get(2).getParamId(), is("2230091"));
        assertThat(result.get(1).getParameters().get(2).getValue(), is("Energy Star"));
        assertThat(result.get(1).getParameters().get(3).getParamId(), is("2230091"));
        assertThat(result.get(1).getParameters().get(3).getValue(), is("EPEAT Gold"));

    }

    @Test
    public void shouldFindAllByProductIdSortByAscCreatedDate() throws Exception {
        final List<Extraction> result = repository.findAllByProductId("1", new Sort(
                Direction.ASC, "createdAt"));
        final Extraction item1 = new Extraction("1", "4876",
                "Green Compliance Certificate/Authority: EPEAT Gold, ROHS, Energy Star 5.2");
        item1.setId(new ObjectId("53e9155b5ed24e4c38d60e3c"));
        assertThat(result.get(0).getText(), is(item1.getText()));
        assertThat(result.get(0).getProductId(), is(item1.getProductId()));
        assertThat(result.get(0).getCategoryId(), is(item1.getCategoryId()));
        assertThat(result.get(0).getText(), is(item1.getText()));
        assertThat(result.get(0).getParameters().get(0).getParamId(), is("2230091"));
        assertThat(result.get(0).getParameters().get(0).getValue(), is("ROHS"));
        assertThat(result.get(0).getParameters().get(1).getParamId(), is("2230090"));
        assertThat(result.get(0).getParameters().get(1).getValue(),
                is("Green Compliance"));
        assertThat(result.get(0).getParameters().get(2).getParamId(), is("2230091"));
        assertThat(result.get(0).getParameters().get(2).getValue(), is("Energy Star"));
        assertThat(result.get(0).getParameters().get(3).getParamId(), is("2230091"));
        assertThat(result.get(0).getParameters().get(3).getValue(), is("EPEAT Gold"));
        final Extraction item2 = new Extraction("1", "4876",
                "Product Line: Intel Core i3 i3-4300M (2.6GHz)");
        item2.setId(new ObjectId("55095aab3aca9ace762ad5f9"));
        assertThat(result.get(1).getText(), is(item2.getText()));
        assertThat(result.get(1).getProductId(), is(item2.getProductId()));
        assertThat(result.get(1).getCategoryId(), is(item2.getCategoryId()));
        assertThat(result.get(1).getParameters().get(0).getParamId(), is("2230387"));
        assertThat(result.get(1).getParameters().get(0).getValue(), is("Core i3"));
        assertThat(result.get(1).getParameters().get(1).getParamId(), is("2230522"));
        assertThat(result.get(1).getParameters().get(1).getValue(), is("i3-4300M"));
        assertThat(result.get(1).getParameters().get(2).getParamId(), is("2229779"));
        assertThat(result.get(1).getParameters().get(2).getValue(), is("2.6"));
        assertThat(result.get(1).getParameters().get(3).getParamId(), is("2230349"));
        assertThat(result.get(1).getParameters().get(3).getValue(), is("Intel"));
    }

}
