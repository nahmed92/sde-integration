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

package com.etilize.automation.sdeintegration.core.config;

import java.net.UnknownHostException;

import org.mongeez.MongeezRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.Validator;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.etilize.automation.sdeintegration.core.Application;
import com.mongodb.Mongo;
import com.mongodb.MongoClient;

/**
 * Mongo Configuration. Note: This is needed because we are using Fongo for testing. In
 * Unit Test configuration we extend this class, instantiate and return the in-memory
 * fongo as mongo instance.
 *
 * @author Faisal Feroz
 * @version 1.0
 */
@Configuration
@Profile("default")
@EnableMongoRepositories(basePackageClasses = Application.class)
class MongoConfig extends AbstractMongoConfiguration {

    @Value("${spring.data.mongo.database:sde-integration}")
    private String database;

    @Value("${spring.data.mongo.host:localhost}")
    private String host;

    @Override
    protected String getDatabaseName() {
        return database;
    }

    @Bean
    @Override
    public Mongo mongo() throws UnknownHostException {
        return new MongoClient(host);
    }

    @Bean
    public Validator jsr303Validator() {
        return new LocalValidatorFactoryBean();
    }

    /**
     * Mongodb validator
     *
     * @param jsr303Validator the validator to use
     * @return
     */
    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(
                (javax.validation.Validator) jsr303Validator());
    }

    @Bean
    public MongeezRunner mongeezRunner(final Mongo mongo,
            @Value("${spring.data.mongo.changeset.enabled:false}") boolean execute) {
        final MongeezRunner runner = new MongeezRunner();
        runner.setFile(new ClassPathResource("mongo-changelog/changelog-master.xml"));
        runner.setDbName(getDatabaseName());
        runner.setExecuteEnabled(execute);
        runner.setMongo(mongo);
        return runner;
    }
}
