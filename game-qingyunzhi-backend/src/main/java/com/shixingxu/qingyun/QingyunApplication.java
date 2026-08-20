package com.shixingxu.qingyun;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 青云志官网后端 API 服务启动入口。
 */
@SpringBootApplication
@MapperScan("com.shixingxu.qingyun.mapper")
public class QingyunApplication {

    public static void main(String[] args) {
        SpringApplication.run(QingyunApplication.class, args);
    }
}
