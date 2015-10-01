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

import static net.javacrumbs.futureconverter.springguava.FutureConverter.*;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import com.etilize.automation.ruta.client.ExtractionParameter;
import com.etilize.automation.ruta.client.ExtractionServiceClient;
import com.etilize.automation.standardization.client.ParameterStandardization;
import com.etilize.automation.standardization.client.StandardizationServiceClient;
import com.google.common.base.Predicates;
import com.google.common.collect.Collections2;
import com.google.common.collect.Lists;
import com.google.common.util.concurrent.AsyncFunction;
import com.google.common.util.concurrent.FutureCallback;
import com.google.common.util.concurrent.FutureFallback;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;

/**
 * {@link ExtractionService} implementation.
 *
 * @author Faisal Feroz
 *
 */
@Component
public class ExtractionServiceImpl implements ExtractionService {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private final ExtractionRepository repo;

    private final ExtractionServiceClient extractionClient;

    private final StandardizationServiceClient standardizationClient;

    @Autowired
    public ExtractionServiceImpl(final ExtractionRepository repo,
            final ExtractionServiceClient extractionClient,
            final StandardizationServiceClient standardizationClient) {
        this.repo = repo;
        this.extractionClient = extractionClient;
        this.standardizationClient = standardizationClient;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ListenableFuture<List<StandardizedParameter>> extract(
            final ExtractionRequest request) {
        final Extraction extraction = new Extraction(request.getProductId(),
                request.getCategoryId(), request.getText());
        extraction.setCreatedAt(DateTime.now());
        final List<ListenableFuture<List<StandardizedParameter>>> futures = Lists.newArrayList();
        for (final Integer parameterId : request.getParameterIds()) {
            final ListenableFuture<ResponseEntity<List<ExtractionParameter>>> future = toGuavaListenableFuture(extractionClient.extract(buildExtractionRequest(
                    request.getText(), request.getCategoryId(), parameterId)));
            futures.add(Futures.transform(future, new ExtractionResponseHandler(request,
                    extraction)));

        }
        final ListenableFuture<List<StandardizedParameter>> future = Futures.transform(
                Futures.successfulAsList(futures),
                new AsyncFunction<List<List<StandardizedParameter>>, List<StandardizedParameter>>() {

                    @Override
                    public ListenableFuture<List<StandardizedParameter>> apply(
                            final List<List<StandardizedParameter>> input)
                            throws Exception {
                        final List<StandardizedParameter> returnVal = Lists.newArrayList();
                        for (final List<StandardizedParameter> list : input) {
                            // there is a chance that no standardization was returned
                            if (list != null) {
                                // there is a possibility that SENTINEL was returned
                                returnVal.addAll(Collections2.filter(list,
                                        Predicates.notNull()));
                            }
                        }
                        return Futures.immediateFuture(returnVal);
                    }
                });
        Futures.addCallback(future, new FutureCallback<List<StandardizedParameter>>() {

            @Override
            public void onSuccess(final List<StandardizedParameter> result) {
                repo.save(extraction);
            }

            @Override
            public void onFailure(final Throwable ex) {
                logger.error("Unable to process request", ex);
            }
        });
        return future;
    }

    private com.etilize.automation.ruta.client.ExtractionRequest buildExtractionRequest(
            final String text, final Integer categoryId, final Integer parameterId) {
        return new com.etilize.automation.ruta.client.ExtractionRequest(text, categoryId,
                parameterId);
    }

    /**
     * Extraction Service response handler
     *
     * @author Faisal Feroz
     *
     */
    private final class ExtractionResponseHandler
            implements
            AsyncFunction<ResponseEntity<List<ExtractionParameter>>, List<StandardizedParameter>> {

        private final ExtractionRequest request;

        private final Extraction extraction;

        private ExtractionResponseHandler(final ExtractionRequest request,
                final Extraction extraction) {
            this.request = request;
            this.extraction = extraction;
        }

        @Override
        public ListenableFuture<List<StandardizedParameter>> apply(
                final ResponseEntity<List<ExtractionParameter>> input) throws Exception {
            // if the output was successful
            if (input.getStatusCode().is2xxSuccessful()) {
                final List<ListenableFuture<StandardizedParameter>> futures = Lists.newArrayList();
                for (final ExtractionParameter parameter : input.getBody()) {

                    final String value = extractStandardizationCandidate(parameter);
                    final ListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> stdFuture = Futures.withFallback(
                            toGuavaListenableFuture(standardizationClient.standardize(
                                    parameter.getId(), value)),
                            new StandardizationFallback());
                    futures.add(Futures.transform(
                            stdFuture,
                            new StandardizationResponseHandler(extraction, value,
                                    request.getProductId(), parameter)));
                }

                return Futures.allAsList(futures);
            }
            // else return failure
            return Futures.immediateFailedFuture(new IllegalStateException(
                    "Unable to process request. Received Response code ["
                            + input.getStatusCode().toString()
                            + "] from Extraction Service"));
        }

        /**
         * Extracts the value from the passed in parameter which should be passed in for
         * standardization
         *
         * @param parameter
         * @return
         */
        private String extractStandardizationCandidate(final ExtractionParameter parameter) {
            return StringUtils.isEmpty(parameter.getUnit()) ? parameter.getValue()
                    : parameter.getUnit();
        }

        /**
         * Standardization service fall back response in case of network errors
         *
         * @author Faisal Feroz
         *
         */
        private final class StandardizationFallback implements
                FutureFallback<ResponseEntity<Resource<ParameterStandardization>>> {

            @Override
            public ListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> create(
                    final Throwable t) throws Exception {
                return Futures.immediateFuture(new ResponseEntity<Resource<ParameterStandardization>>(
                        HttpStatus.INTERNAL_SERVER_ERROR));
            }
        }
    }

    /**
     * Standardization Service Response Handler
     *
     * @author Faisal Feroz
     *
     */
    private final class StandardizationResponseHandler
            implements
            AsyncFunction<ResponseEntity<Resource<ParameterStandardization>>, StandardizedParameter> {

        private final Extraction extraction;

        private final String variation;

        private final int productId;

        private final ExtractionParameter parameter;

        private StandardizationResponseHandler(final Extraction extraction,
                final String variation, final int productId,
                final ExtractionParameter parameter) {
            this.extraction = extraction;
            this.variation = variation;
            this.productId = productId;
            this.parameter = parameter;
        }

        @Override
        public ListenableFuture<StandardizedParameter> apply(
                final ResponseEntity<Resource<ParameterStandardization>> input)
                throws Exception {
            final Parameter param = new Parameter(parameter);

            boolean shouldAdd = true;
            if (input.getStatusCode().is2xxSuccessful()) {
                final String standardizedValue = input.getBody().getContent().getStandardizations().get(
                        variation);
                param.setStandardization(new Standardization(standardizedValue));
                shouldAdd = !StandardizationServiceClient.SENTINEL.equals(standardizedValue);
            } else if (input.getStatusCode() == HttpStatus.NOT_FOUND) {
                param.setStandardization(new Standardization(Status.NOT_FOUND));
                logger.warn(
                        "No Standardization Found for Parameter: {} of product with Id: {}",
                        param, productId);
            } else {
                param.setStandardization(new Standardization(Status.ERROR));
                logger.error(
                        "Unable to Standardize Parameter: {} of product with Id: {} due to error[{}]",
                        param, productId, input.getStatusCode());
            }

            if (shouldAdd) {
                final StandardizedParameter stdParam = new StandardizedParameter(
                        param.getParamId(), //
                        param.getStandardizedValue(), //
                        param.getStandardizedUnit(), param.isStandardized());

                param.setExport(stdParam);
                extraction.addParameter(param);
                return Futures.immediateFuture(stdParam);
            }

            logger.info(
                    "SENTINEL Standardization Found for Parameter: {} of product with Id: {}",
                    param, productId);
            return Futures.immediateFuture(null);
        }
    }
}
