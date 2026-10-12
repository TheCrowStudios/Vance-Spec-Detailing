package com.thecrowstudios.vance_spec_detailing.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ServicePackage {
    private String id;
    private String name;
    private String description;
    private List<String> features;
    private int hatchbackPrice;
    private int suvPrice;
}