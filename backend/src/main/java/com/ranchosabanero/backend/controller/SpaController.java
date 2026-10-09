package com.ranchosabanero.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Las rutas de React Router (/menu, /ubicacion...) existen solo en el navegador:
 * si alguien entra directo o recarga la página, el servidor devuelve index.html y React decide qué mostrar.
 */
@Controller
public class SpaController {

    @GetMapping({"/menu", "/ubicacion", "/contacto", "/admin"})
    public String spa() {
        return "forward:/index.html";
    }
}
