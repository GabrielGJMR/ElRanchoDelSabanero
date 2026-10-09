package com.ranchosabanero.backend.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

/**
 * Las rutas de React Router (/menu, /ubicacion, /admin...) existen solo en el navegador: si alguien entra
 * directo, recarga la página, o escribe una URL que no existe (ej. /menu/algo), el servidor normalmente
 * respondería 404 antes de que React llegue a cargar. En vez de eso, cualquier 404 que no sea de /api/**
 * se reenvía a index.html y deja que React Router decida qué mostrar (incluida la redirección a "/" del
 * catch-all "*" en App.tsx). Las rutas de /api/** mantienen su 404 real en JSON.
 */
@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request, HttpServletResponse response) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        boolean notFound = status != null && Integer.parseInt(status.toString()) == HttpStatus.NOT_FOUND.value();
        boolean isApi = path != null && path.toString().startsWith("/api/");

        if (notFound && !isApi) {
            response.setStatus(HttpStatus.OK.value()); // es una ruta de React Router, no un error real
            return "forward:/index.html";
        }
        HttpStatus httpStatus = status == null
                ? HttpStatus.INTERNAL_SERVER_ERROR
                : HttpStatus.valueOf(Integer.parseInt(status.toString()));
        return error(httpStatus);
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status) {
        return ResponseEntity.status(status).contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("error", status.getReasonPhrase()));
    }
}
