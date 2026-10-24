package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.entity.Category;
import com.ranchosabanero.backend.entity.Item;
import com.ranchosabanero.backend.repository.CategoryRepository;
import com.ranchosabanero.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.function.Consumer;

/**
 * Al arrancar, traduce cualquier categoría o platillo que todavía no tenga traducción: por ejemplo el menú
 * sembrado por V2__seed_menu.sql (se insertó directo por SQL, sin pasar por MenuService) o algo que se
 * guardó mientras LibreTranslate no respondía. No hace nada si la traducción automática está desactivada
 * (app.translate.url vacío, como en desarrollo/pruebas).
 */
@Component
@RequiredArgsConstructor
public class TranslationBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TranslationBackfillRunner.class);

    private final CategoryRepository categories;
    private final ItemRepository items;
    private final TranslationService translator;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!translator.isEnabled()) {
            return;
        }

        int translatedCategories = 0;
        for (Category c : categories.findAll()) {
            boolean changed = false;
            if (c.getName() != null && c.getNameEn() == null) {
                apply(translator.translate(c.getName()), c::setNameEn, c::setNameFr, c::setNameZh);
                changed = true;
            }
            if (c.getNote() != null && c.getNoteEn() == null) {
                apply(translator.translate(c.getNote()), c::setNoteEn, c::setNoteFr, c::setNoteZh);
                changed = true;
            }
            if (changed) translatedCategories++;
        }

        int translatedItems = 0;
        for (Item i : items.findAll()) {
            boolean changed = false;
            if (i.getName() != null && i.getNameEn() == null) {
                apply(translator.translate(i.getName()), i::setNameEn, i::setNameFr, i::setNameZh);
                changed = true;
            }
            if (i.getDescription() != null && i.getDescriptionEn() == null) {
                apply(translator.translate(i.getDescription()), i::setDescriptionEn, i::setDescriptionFr, i::setDescriptionZh);
                changed = true;
            }
            if (changed) translatedItems++;
        }

        if (translatedCategories > 0 || translatedItems > 0) {
            log.info("Traducción automática: {} categoría(s) y {} platillo(s) traducidos al arrancar.",
                    translatedCategories, translatedItems);
        }
    }

    private void apply(TranslationService.Translations t, Consumer<String> en, Consumer<String> fr, Consumer<String> zh) {
        en.accept(t.en());
        fr.accept(t.fr());
        zh.accept(t.zh());
    }
}
