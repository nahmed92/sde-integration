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
import static org.mockito.Mockito.*;

import java.net.ConnectException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.concurrent.SettableListenableFuture;

import com.etilize.automation.ruta.client.ExtractionHeader;
import com.etilize.automation.ruta.client.ExtractionParameter;
import com.etilize.automation.ruta.client.ExtractionServiceClient;
import com.etilize.automation.sdeintegration.core.test.base.AbstractMongoIntegrationTest;
import com.etilize.automation.standardization.client.ParameterStandardization;
import com.etilize.automation.standardization.client.StandardizationServiceClient;
import com.google.common.collect.Lists;
import com.google.common.util.concurrent.ListenableFuture;
import com.lordofthejars.nosqlunit.annotation.ShouldMatchDataSet;
import com.lordofthejars.nosqlunit.annotation.UsingDataSet;
import com.lordofthejars.nosqlunit.core.LoadStrategyEnum;

@UsingDataSet(locations = "/reset.bson", loadStrategy = LoadStrategyEnum.DELETE_ALL)
public class ExtractionServiceImplTest extends AbstractMongoIntegrationTest {

    @Autowired
    private ExtractionRepository repo;

    @Mock
    private ExtractionServiceClient extractionClient;

    @Mock
    private StandardizationServiceClient standardizationClient;

    private ExtractionServiceImpl service;

    @Before
    public void before() {
        super.before();
        service = new ExtractionServiceImpl(repo, extractionClient, standardizationClient);
    }

    @ShouldMatchDataSet(location = "extractionResponse.bson")
    @Test
    public void shouldExtract() throws Exception {
        // given
        final String header = "Processor & Chipset|123";
        final String category = "Notebooks|4876";
        final String text = "Core i3 2.6GHZ";
        final SettableListenableFuture<ResponseEntity<List<ExtractionHeader>>> extractionFuture = new SettableListenableFuture<>();
        final List<ExtractionHeader> body = Lists.newArrayList(new ExtractionHeader(
                header, Lists.newArrayList(new ExtractionParameter("processortype",
                        "Core i3", null, 2230387), new ExtractionParameter(
                        "processorspeed", "2.6", "GHZ", 2229779))));
        extractionFuture.set(new ResponseEntity<List<ExtractionHeader>>(body,
                HttpStatus.OK));
        when(
                extractionClient.extract(new com.etilize.automation.ruta.client.ExtractionRequest(
                        text, category, header))).thenReturn(extractionFuture);
        final SettableListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> std1Future = new SettableListenableFuture<>();
        std1Future.set(new ResponseEntity<Resource<ParameterStandardization>>(
                HttpStatus.NOT_FOUND));
        when(standardizationClient.standardize(2230387, "Core i3")).thenReturn(std1Future);

        final SettableListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> std2Future = new SettableListenableFuture<>();
        final ParameterStandardization standardization = new ParameterStandardization();
        standardization.setId(2229779);
        HashMap<String, String> map = new HashMap<>();
        map.put("GHZ", "GHz");
        standardization.setStandardizations(map);
        std2Future.set(new ResponseEntity<Resource<ParameterStandardization>>(
                new Resource<ParameterStandardization>(standardization), HttpStatus.OK));
        when(standardizationClient.standardize(2229779, "GHZ")).thenReturn(std2Future);

        // when
        final ExtractionRequest request = new ExtractionRequest(1, text, category,
                Arrays.asList(header));
        final ListenableFuture<List<StandardizedParameter>> result = service.extract(request);

        // then
        assertThat(result, is(notNullValue()));

        final List<StandardizedParameter> parameters = result.get();
        assertThat(parameters, is(notNullValue()));
        assertThat(parameters, hasSize(2));
    }

    @Test
    public void shouldReturnErrorWhenExtractionServiceReturnsError() throws Exception {
        // given
        final String header = "Processor & Chipset|123";
        final String category = "Notebooks|4876";
        final String text = "Core i3 2.6GHZ";
        final SettableListenableFuture<ResponseEntity<List<ExtractionHeader>>> extractionFuture = new SettableListenableFuture<>();
        extractionFuture.set(new ResponseEntity<List<ExtractionHeader>>(
                HttpStatus.INTERNAL_SERVER_ERROR));
        when(
                extractionClient.extract(new com.etilize.automation.ruta.client.ExtractionRequest(
                        text, category, header))).thenReturn(extractionFuture);

        final ExtractionRequest request = new ExtractionRequest(1, text, category,
                Arrays.asList(header));

        // when
        final ListenableFuture<List<StandardizedParameter>> result = service.extract(request);

        // then
        assertThat(result, is(notNullValue()));

        try {
            result.get();
            Assert.fail("Exception should have been thrown.");
        } catch (ExecutionException e) {
            assertThat(e.getCause(),
                    Matchers.is(Matchers.instanceOf(IllegalStateException.class)));
        }
    }

    @ShouldMatchDataSet(location = "standardizationResponse.bson")
    @Test
    public void shouldnotReturnErrorWhenStandardizationServiceReturnsError()
            throws Exception {
        // given
        final String header = "Processor & Chipset|123";
        final String category = "Notebooks|4876";
        final String text = "Core i3 2.6GHZ";
        final SettableListenableFuture<ResponseEntity<List<ExtractionHeader>>> extractionFuture = new SettableListenableFuture<>();
        final List<ExtractionHeader> body = Lists.newArrayList(new ExtractionHeader(
                header, Lists.newArrayList(new ExtractionParameter("processortype",
                        "Core i3", null, 2230387), new ExtractionParameter(
                        "processorspeed", "2.6", "GHZ", 2229779))));
        extractionFuture.set(new ResponseEntity<List<ExtractionHeader>>(body,
                HttpStatus.OK));
        when(
                extractionClient.extract(new com.etilize.automation.ruta.client.ExtractionRequest(
                        text, category, header))).thenReturn(extractionFuture);

        final SettableListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> std1Future = new SettableListenableFuture<>();
        std1Future.set(new ResponseEntity<Resource<ParameterStandardization>>(
                HttpStatus.INTERNAL_SERVER_ERROR));
        when(standardizationClient.standardize(2230387, "Core i3")).thenReturn(std1Future);

        final SettableListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> std2Future = new SettableListenableFuture<>();
        std2Future.setException(new ConnectException());
        when(standardizationClient.standardize(2229779, "GHZ")).thenReturn(std2Future);

        // when
        final ExtractionRequest request = new ExtractionRequest(1, text, category,
                Arrays.asList(header));
        final ListenableFuture<List<StandardizedParameter>> result = service.extract(request);

        // then
        assertThat(result, is(notNullValue()));

        final List<StandardizedParameter> parameters = result.get();
        assertThat(parameters, is(notNullValue()));
        assertThat(parameters, hasSize(2));
    }
}
