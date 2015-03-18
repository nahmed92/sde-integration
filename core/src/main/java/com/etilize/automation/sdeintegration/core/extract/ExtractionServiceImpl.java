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

import com.etilize.automation.ruta.client.ExtractionHeader;
import com.etilize.automation.ruta.client.ExtractionParameter;
import com.etilize.automation.ruta.client.ExtractionServiceClient;
import com.etilize.automation.standardization.client.ParameterStandardization;
import com.etilize.automation.standardization.client.StandardizationServiceClient;
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
        final ListenableFuture<ResponseEntity<List<ExtractionHeader>>> extractionFuture = toGuavaListenableFuture(extractionClient.extract(request.toExtractionRequest()));
        return Futures.transform(extractionFuture, new ExtractionResponseHandler(request));
    }

    /**
     * Extraction Service response handler
     *
     * @author Faisal Feroz
     *
     */
    private final class ExtractionResponseHandler
            implements
            AsyncFunction<ResponseEntity<List<ExtractionHeader>>, List<StandardizedParameter>> {

        private final ExtractionRequest request;

        private ExtractionResponseHandler(final ExtractionRequest request) {
            this.request = request;
        }

        @Override
        public ListenableFuture<List<StandardizedParameter>> apply(
                final ResponseEntity<List<ExtractionHeader>> input) throws Exception {
            // if the output was successful
            if (input.getStatusCode().is2xxSuccessful()) {
                final Extraction extraction = new Extraction(request.getProductId(),
                        request.getCategory(), request.getText());
                extraction.setCreatedAt(DateTime.now());

                final List<ListenableFuture<StandardizedParameter>> futures = Lists.newArrayList();
                for (final ExtractionHeader header : input.getBody()) {

                    final Header exHeader = new Header(header.getName());
                    extraction.addHeader(exHeader);

                    for (final ExtractionParameter parameter : header.getParameters()) {
                        final String value = extractStandardizationCandidate(parameter);
                        final ListenableFuture<ResponseEntity<Resource<ParameterStandardization>>> stdFuture = Futures.withFallback(
                                toGuavaListenableFuture(standardizationClient.standardize(
                                        parameter.getId(), value)),
                                new StandardizationFallback());
                        futures.add(Futures.transform(
                                stdFuture,
                                new StandardizationResponseHandler(value,
                                        request.getProductId(), exHeader, parameter)));
                    }
                }

                final ListenableFuture<List<StandardizedParameter>> resultFuture = Futures.allAsList(futures);
                Futures.addCallback(resultFuture,
                        new FutureCallback<List<StandardizedParameter>>() {

                            @Override
                            public void onSuccess(final List<StandardizedParameter> result) {
                                repo.save(extraction);
                            }

                            @Override
                            public void onFailure(final Throwable ex) {
                                logger.error("Unable to process request", ex);
                            }
                        });
                return resultFuture;
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

    private final class StandardizationResponseHandler
            implements
            AsyncFunction<ResponseEntity<Resource<ParameterStandardization>>, StandardizedParameter> {

        private final String variation;

        private final int productId;

        private final Header header;

        private final ExtractionParameter parameter;

        private StandardizationResponseHandler(final String variation,
                final int productId, final Header header,
                final ExtractionParameter parameter) {
            this.variation = variation;
            this.productId = productId;
            this.header = header;
            this.parameter = parameter;
        }

        @Override
        public ListenableFuture<StandardizedParameter> apply(
                final ResponseEntity<Resource<ParameterStandardization>> input)
                throws Exception {
            final Parameter param = new Parameter(parameter);

            if (input.getStatusCode().is2xxSuccessful()) {
                final String standardizedValue = input.getBody().getContent().getStandardizations().get(
                        variation);
                param.setStandardization(new Standardization(standardizedValue));
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

            final StandardizedParameter stdParam = new StandardizedParameter(
                    param.getParamId(), //
                    param.getStandardizedValue(), //
                    param.getStandardizedUnit());

            param.setExport(stdParam);

            // add to header
            header.addParameter(param);

            return Futures.immediateFuture(stdParam);
        }
    }
}
