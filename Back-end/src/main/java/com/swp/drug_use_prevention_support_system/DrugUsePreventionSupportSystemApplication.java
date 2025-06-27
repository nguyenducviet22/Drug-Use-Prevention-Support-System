package com.swp.drug_use_prevention_support_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DrugUsePreventionSupportSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(DrugUsePreventionSupportSystemApplication.class, args);
	}

}
