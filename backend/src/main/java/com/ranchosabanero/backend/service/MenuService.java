package com.ranchosabanero.backend.service;

import com.ranchosabanero.backend.dto.CategoryRequest;
import com.ranchosabanero.backend.dto.ItemRequest;
import com.ranchosabanero.backend.dto.MenuCategoryResponse;
import com.ranchosabanero.backend.dto.MenuItemResponse;
import com.ranchosabanero.backend.entity.Category;
import com.ranchosabanero.backend.entity.Item;
import com.ranchosabanero.backend.repository.CategoryRepository;
import com.ranchosabanero.backend.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private static final String ITEM_PHOTOS_FOLDER = "rancho/platillos";

    private final CategoryRepository categories;
    private final ItemRepository items;
    private final ImageStorage images;

    /** @param onlyAvailable true para el menú público, false para el panel de administración */
    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> menu(boolean onlyAvailable) {
        Map<Long, List<MenuItemResponse>> byCategory = items.findAllByOrderByPositionAscIdAsc().stream()
                .filter(i -> !onlyAvailable || i.isAvailable())
                .collect(Collectors.groupingBy(i -> i.getCategory().getId(), LinkedHashMap::new,
                        Collectors.mapping(i -> MenuItemResponse.from(i, images), Collectors.toList())));

        return categories.findAllByOrderByPositionAscIdAsc().stream()
                .map(c -> new MenuCategoryResponse(c.getId(), c.getName(), c.getNote(),
                        byCategory.getOrDefault(c.getId(), List.of())))
                .toList();
    }

    // ---- Categorías ----

    @Transactional
    public MenuCategoryResponse createCategory(CategoryRequest req) {
        Category category = new Category();
        category.setPosition(categories.countByIdNotNull());
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
        return MenuItemResponse.from(items.save(item), images);
    }

    @Transactional
    public MenuItemResponse updateItem(Long id, ItemRequest req) {
        Item item = findItem(id);
        applyItem(item, req);
        return MenuItemResponse.from(item, images);
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
        return MenuItemResponse.from(item, images);
    }

    @Transactional
    public MenuItemResponse removeImage(Long id) {
        Item item = findItem(id);
        images.delete(item.getImage());
        item.setImage(null);
        return MenuItemResponse.from(item, images);
    }

    private Item findItem(Long id) {
        return items.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Platillo no encontrado"));
    }

    private Category findCategory(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private void applyCategory(Category category, CategoryRequest req) {
        category.setName(req.name().trim());
        category.setNote(blankToNull(req.note()));
    }

    private void applyItem(Item item, ItemRequest req) {
        item.setName(req.name().trim());
        item.setDescription(blankToNull(req.description()));
        item.setPrice(req.price());
        if (req.available() != null) {
            item.setAvailable(req.available());
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
