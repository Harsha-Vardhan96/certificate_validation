package com.certiverify.application;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@SpringBootTest
@Disabled("Manual schema inspection utility; not part of automated unit test suite")
public class DbSchemaInspectionTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.certiverify.application.client.CertificateServiceClient certificateServiceClient;

    @Test
    void inspectAndFixColumns() {
        jdbcTemplate.execute("ALTER TABLE applications ALTER COLUMN student_id TYPE bigint USING NULL");
        jdbcTemplate.execute("ALTER TABLE applications ALTER COLUMN institution_id TYPE bigint USING NULL");

        List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'applications'"
        );
        System.out.println(">>> UPDATED COLUMNS IN applications TABLE IN POSTGRESQL <<<");
        for (Map<String, Object> col : columns) {
            System.out.println(col.get("column_name") + " : " + col.get("data_type"));
        }
    }
}
