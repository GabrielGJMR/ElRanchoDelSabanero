package com.ranchosabanero.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Las rutas de React Router se resuelven en el navegador: el servidor siempre devuelve index.html. */
@Controller
public class SpaController {

    @GetMapping("/admin")
    public String admin() {
        return "forward:/index.html";
    }
}
