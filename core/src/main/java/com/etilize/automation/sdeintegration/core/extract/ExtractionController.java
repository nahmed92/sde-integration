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

import java.util.List;
import java.util.concurrent.Future;

import net.javacrumbs.futureconverter.springguava.FutureConverter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.etilize.commons.controller.AbstractRepositoryRestController;

/**
 * Rest controller for Extraction
 *
 * @author Faisal Feroz
 *
 */
@RestResource(rel = "extract", path = "/extract")
@RestController
@RepositoryRestController
public class ExtractionController extends AbstractRepositoryRestController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private ExtractionService service;

    @Autowired
    public ExtractionController(
            final PagedResourcesAssembler<Object> pagedResourcesAssembler,
            final ExtractionService service) {
        super(pagedResourcesAssembler);
        this.service = service;
    }

    @RequestMapping(value = "/extract", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    public Future<List<StandardizedParameter>> extract(
            @RequestBody final ExtractionRequest request) {
        Assert.notNull(request);
        Assert.notNull(request.getProductId(), "ProductId is Required");
        Assert.hasText(request.getText(),
                "Text must contain atleast one non-space character");
        Assert.notNull(request.getCategoryId(), "CategoryId is required");
        Assert.notEmpty(request.getParameterIds(), "Atleast one paramterId is required");

        logger.debug("Receiver request {}", request);

        return FutureConverter.toSpringListenableFuture(service.extract(request));
    }

    // for unit testing
    void setExtractionService(final ExtractionService service) {
        this.service = service;
    }

}
