package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.dto.CategoryRequest;
import com.ranchosabanero.backend.dto.ItemRequest;
import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.dto.MenuItemResponse;
import com.ranchosabanero.backend.dto.MenuRequest;
import com.ranchosabanero.backend.dto.MenuResponse;
import com.ranchosabanero.backend.entity.Category;
import com.ranchosabanero.backend.entity.Item;
import com.ranchosabanero.backend.entity.Menu;
import com.ranchosabanero.backend.repository.CategoryRepository;
import com.ranchosabanero.backend.repository.ItemRepository;
import com.ranchosabanero.backend.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private static final String ITEM_PHOTOS_FOLDER = "rancho/platillos";

    private final MenuRepository menus;
    private final CategoryRepository categories;
    private final ItemRepository items;
    private final ImageStorage images;
    private final TranslationService translator;

    /**
     * Menú público por defecto (el primero que no sea "eventos", hoy "Menú Principal"), para
     * quien llegue a /api/menu sin pedir un slug en particular.
     * @param onlyAvailable true para el menú público, false para el panel de administración
     * @param lang          "es" (por defecto), "en", "fr" o "zh"
     */
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> menu(boolean onlyAvailable, String lang) {
        Menu principal = menus.findAllByOrderByPositionAscIdAsc().stream()
                .filter(m -> !"eventos".equals(m.getSlug()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menú no encontrado"));
        return categoriesForMenu(principal.getId(), onlyAvailable, lang);
    }

    /** Menú público de un solo tipo con página propia (p.ej. "eventos"). 404 si no existe ese slug. */
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> publicMenuBySlug(String slug, String lang) {
        Menu menu = menus.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menú no encontrado"));
        return categoriesForMenu(menu.getId(), true, lang);
    }

    /** Los 3 menús de comida (excluye "Eventos", que tiene su propia página) para armar las pestañas públicas. */
    @Transactional(readOnly = true)
    public List<MenuResponse> publicMenuTypes() {
        return menus.findAllByOrderByPositionAscIdAsc().stream()
                .filter(m -> m.getSlug() != null && !m.getSlug().equals("eventos"))
                .map(MenuResponse::from)
                .toList();
    }

    // ---- Tipos de menú ----

    @Transactional(readOnly = true)
    public List<MenuResponse> listMenus() {
        return menus.findAllByOrderByPositionAscIdAsc().stream().map(MenuResponse::from).toList();
    }

    @Transactional
    public MenuResponse createMenu(MenuRequest req) {
        Menu menu = new Menu();
        menu.setName(req.name().trim());
        menu.setPosition(menus.countByIdNotNull());
        menus.save(menu);
        return MenuResponse.from(menu);
    }

    @Transactional
    public void renameMenu(Long id, MenuRequest req) {
        findMenu(id).setName(req.name().trim());
    }

    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = findMenu(id);
        List<Long> categoryIds = categories.findAllByMenuIdOrderByPositionAscIdAsc(id).stream().map(Category::getId).toList();
        List<String> photos = items.findByCategoryIdIn(categoryIds).stream().map(Item::getImage).toList();
        menus.delete(menu); // borra también sus categorías y platillos (ON DELETE CASCADE)
        photos.forEach(images::delete);
    }

    /**
     * Categorías (con sus platillos) de un solo tipo de menú.
     * @param onlyAvailable true para el público (oculta platillos desactivados), false para el panel de administración
     */
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> categoriesForMenu(Long menuId, boolean onlyAvailable, String lang) {
        findMenu(menuId);
        Map<Long, List<MenuItemResponse>> byCategory = items.findAllByOrderByPositionAscIdAsc().stream()
                .filter(i -> i.getCategory().getMenu().getId().equals(menuId))
                .filter(i -> !onlyAvailable || i.isAvailable())
                .collect(Collectors.groupingBy(i -> i.getCategory().getId(), LinkedHashMap::new,
                        Collectors.mapping(i -> MenuItemResponse.from(i, images, lang), Collectors.toList())));

        return categories.findAllByMenuIdOrderByPositionAscIdAsc(menuId).stream()
                .map(c -> MenuCategoryResponse.from(c, lang, byCategory.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    // ---- Categorías ----

    @Transactional
    public MenuCategoryResponse createCategory(CategoryRequest req) {
        Category category = new Category();
        category.setPosition(categories.countByMenuId(req.menuId()));
        applyCategory(category, req);
        categories.save(category);
        return new MenuCategoryResponse(category.getId(), category.getName(), category.getNote(), List.of());
    }

    @Transactional
    public void updateCategory(Long id, CategoryRequest req) {
        applyCategory(findCategory(id), req);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategory(id);
        List<String> photos = items.findByCategoryId(id).stream().map(Item::getImage).toList();
        categories.delete(category); // borra también sus platillos (ON DELETE CASCADE)
        photos.forEach(images::delete);
    }

    // ---- Platillos ----

    @Transactional
    public MenuItemResponse createItem(ItemRequest req) {
        if (req.categoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Falta la categoría");
        }
        Category category = findCategory(req.categoryId());
        Item item = new Item();
        item.setCategory(category);
        item.setPosition(items.nextPosition(category.getId()));
        applyItem(item, req);
        return MenuItemResponse.from(items.save(item), images, "es");
    }

    @Transactional
    public MenuItemResponse updateItem(Long id, ItemRequest req) {
        Item item = findItem(id);
        applyItem(item, req);
        return MenuItemResponse.from(item, images, "es");
    }

    @Transactional
    public void deleteItem(Long id) {
        Item item = findItem(id);
        items.delete(item);
        images.delete(item.getImage());
    }

    /** Guarda (o reemplaza) la foto del platillo. */
    @Transactional
    public MenuItemResponse setImage(Long id, MultipartFile file) {
        Item item = findItem(id);
        String previous = item.getImage();
        item.setImage(images.store(file, ITEM_PHOTOS_FOLDER));
        images.delete(previous);
        return MenuItemResponse.from(item, images, "es");
    }

    @Transactional
    public MenuItemResponse removeImage(Long id) {
        Item item = findItem(id);
        images.delete(item.getImage());
        item.setImage(null);
        return MenuItemResponse.from(item, images, "es");
    }

    private Item findItem(Long id) {
        return items.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Platillo no encontrado"));
    }

    private Category findCategory(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private Menu findMenu(Long id) {
        return menus.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menú no encontrado"));
    }

    private void applyCategory(Category category, CategoryRequest req) {
        String name = req.name().trim();
        String note = blankToNull(req.note());
        boolean nameChanged = !name.equals(category.getName());
        boolean noteChanged = !Objects.equals(note, category.getNote());

        category.setMenu(findMenu(req.menuId()));
        category.setName(name);
        category.setNote(note);

        if (nameChanged) {
            TranslationService.Translations t = translator.translate(name);
            category.setNameEn(t.en());
            category.setNameFr(t.fr());
            category.setNameZh(t.zh());
        }
        if (noteChanged) {
            TranslationService.Translations t = translator.translate(note);
            category.setNoteEn(t.en());
            category.setNoteFr(t.fr());
            category.setNoteZh(t.zh());
        }
    }

    private void applyItem(Item item, ItemRequest req) {
        String name = req.name().trim();
        String description = blankToNull(req.description());
        boolean nameChanged = !name.equals(item.getName());
        boolean descriptionChanged = !Objects.equals(description, item.getDescription());

        item.setName(name);
        item.setDescription(description);
        item.setPrice(req.price());
        if (req.available() != null) {
            item.setAvailable(req.available());
        }

        if (nameChanged) {
            TranslationService.Translations t = translator.translate(name);
            item.setNameEn(t.en());
            item.setNameFr(t.fr());
            item.setNameZh(t.zh());
        }
        if (descriptionChanged) {
            TranslationService.Translations t = translator.translate(description);
            item.setDescriptionEn(t.en());
            item.setDescriptionFr(t.fr());
            item.setDescriptionZh(t.zh());
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
