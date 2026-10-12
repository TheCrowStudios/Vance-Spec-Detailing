package com.thecrowstudios.vance_spec_detailing.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@Controller 
@CrossOrigin(origins = "*") // Allows your frontend to connect smoothly
public class DetailingController {
    @GetMapping("/design1")
    public String getIndex() {
        return "index";
    }

    @GetMapping("/design2")
    public String getIndex2() {
        return "index_2";
    }
}