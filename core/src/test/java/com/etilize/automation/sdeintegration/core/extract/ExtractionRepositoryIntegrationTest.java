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

import org.bson.types.ObjectId;
import org.joda.time.DateTime;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

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
        final Extraction item = new Extraction(1, "Notebooks|4876",
                "Product Line: Intel Core i3 i3-4300M (2.6GHz)");
        item.setId(new ObjectId("55095aab3aca9ace762ad5f9"));
        assertThat(result.getContent(), hasItem(item));
    }
}
