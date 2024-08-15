"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    // Fonction pour récupérer les données de l'API
    function fetchData() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Popup chargée, récupération des données...');
            try {
                const response = yield fetch('https://api.kingdom.so/open/marketplace');
                const data = yield response.json();
                console.log("Réponse brute de l'API:", data);
                // Remplir les sélecteurs avec les valeurs uniques
                populateSelects(data.toBuy);
                const buyTable = document.getElementById('buyTable');
                const sellTable = document.getElementById('sellTable');
                if (data.toBuy.length > 0) {
                    populateTable(buyTable, data.toBuy, 'buy');
                }
                else {
                    console.error("Les données 'toBuy' sont vides.");
                }
                if (data.toSell.length > 0) {
                    populateTable(sellTable, data.toSell, 'sell');
                }
                else {
                    console.error("Les données 'toSell' sont vides.");
                }
            }
            catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        });
    }
    // Fonction pour remplir les sélecteurs avec les valeurs uniques
    function populateSelects(data) {
        const categorySelect = document.getElementById('categorySelect');
        const subCategorySelect = document.getElementById('subCategorySelect');
        const categories = new Set();
        const subCategories = new Set();
        data.forEach(item => {
            if (item.object.category) {
                categories.add(item.object.category);
            }
            if (item.object.subCategory) {
                subCategories.add(item.object.subCategory);
            }
        });
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
        subCategories.forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory;
            option.textContent = subCategory;
            subCategorySelect.appendChild(option);
        });
    }
    // Fonction pour remplir le tableau avec les données
    function populateTable(table, data, type) {
        const tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = ''; // Vider le contenu actuel du tableau
            data.forEach(item => {
                const { tile, object, pricing } = item;
                const { url } = tile;
                const { category, subCategory, metadata, imageUrl } = object;
                const { unitPrice, availableQuantity, desiredQuantity } = pricing;
                // Création de l'image pour l'unité de prix
                const priceImage = `<img src="./images/gold.png" alt="Gold" style="height: 16px; vertical-align: middle;">`;
                // Détermination de l'image de l'objet
                const objectImage = imageUrl ? `<img src="${imageUrl}" style="height: 50px; vertical-align: middle;">` : '';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${objectImage}</td>
                    <td data-sort="name">${(metadata === null || metadata === void 0 ? void 0 : metadata.title) || 'N/A'}</td>
                    <td data-sort="price">${unitPrice || 'N/A'} ${priceImage}</td>
                    
                    <td data-sort="${type === 'buy' ? 'availableQuantity' : 'desiredQuantity'}">
                        ${type === 'buy' ? availableQuantity : desiredQuantity || 'N/A'}
                    </td>
                    <td class="hidden-column">${category || 'N/A'}</td>
                    <td class="hidden-column">${subCategory || 'N/A'}</td>
                    <td class="table-action-cell" ><a href="${url}" target="_blank"><img src="./images/dropbox.png" alt="Go" style="height: 25px; vertical-align: middle;"></a></td>
                `;
                tbody.appendChild(row);
            });
            addSortListeners(table);
        }
    }
    // Fonction pour ajouter les écouteurs d'événements de tri aux en-têtes
    function addSortListeners(table) {
        const headers = table.querySelectorAll('thead th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const sortKey = header.getAttribute('data-sort');
                if (sortKey) {
                    toggleSort(table, sortKey, header);
                }
            });
        });
    }
    // Fonction pour activer le tri multi-colonnes
    function toggleSort(table, sortKey, header) {
        var _a, _b;
        const headers = table.querySelectorAll('thead th[data-sort]');
        // Mettre à jour les indicateurs de tri
        headers.forEach(th => {
            var _a;
            if (th !== header) {
                th.classList.remove('asc', 'desc');
                (_a = th.querySelector('.sort-indicator')) === null || _a === void 0 ? void 0 : _a.classList.remove('asc', 'desc');
            }
        });
        // Gérer le tri multi-colonnes
        const sortDirections = Array.from(headers)
            .filter(th => th.classList.contains('asc') || th.classList.contains('desc'))
            .map(th => ({
            key: th.getAttribute('data-sort') || '',
            direction: th.classList.contains('asc') ? 'asc' : 'desc'
        }));
        const sortDirection = header.classList.contains('asc') ? 'desc' : 'asc';
        header.classList.toggle('asc', sortDirection === 'asc');
        header.classList.toggle('desc', sortDirection === 'desc');
        (_a = header.querySelector('.sort-indicator')) === null || _a === void 0 ? void 0 : _a.classList.toggle('asc', sortDirection === 'asc');
        (_b = header.querySelector('.sort-indicator')) === null || _b === void 0 ? void 0 : _b.classList.toggle('desc', sortDirection === 'desc');
        sortDirections.push({ key: sortKey, direction: sortDirection });
        sortTable(table, sortDirections);
    }
    // Fonction pour trier le tableau
    function sortTable(table, sortDirections) {
        const tbody = table.querySelector('tbody');
        if (!tbody)
            return;
        const rowsArray = Array.from(tbody.querySelectorAll('tr'));
        rowsArray.sort((a, b) => {
            var _a, _b;
            for (const { key, direction } of sortDirections) {
                const cellA = ((_a = a.querySelector(`td[data-sort="${key}"]`)) === null || _a === void 0 ? void 0 : _a.textContent) || '';
                const cellB = ((_b = b.querySelector(`td[data-sort="${key}"]`)) === null || _b === void 0 ? void 0 : _b.textContent) || '';
                const valueA = isNaN(parseFloat(cellA)) ? cellA : parseFloat(cellA);
                const valueB = isNaN(parseFloat(cellB)) ? cellB : parseFloat(cellB);
                if (valueA > valueB)
                    return direction === 'asc' ? 1 : -1;
                if (valueA < valueB)
                    return direction === 'asc' ? -1 : 1;
            }
            return 0;
        });
        tbody.innerHTML = '';
        rowsArray.forEach(row => tbody.appendChild(row));
    }
    function filterResults() {
        const nameSearch = document.getElementById('nameSearch').value.toLowerCase();
        const categorySelect = document.getElementById('categorySelect').value;
        const subCategorySelect = document.getElementById('subCategorySelect').value;
        const tables = document.querySelectorAll('.tab-content.active table');
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.querySelectorAll('tr').forEach(row => {
                    var _a, _b, _c, _d;
                    const cells = row.querySelectorAll('td');
                    // Indices ajustés pour correspondre aux colonnes du tableau
                    const name = ((_b = (_a = cells[1]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || ''; // Nom est à l'indice 1
                    const category = ((_c = cells[4]) === null || _c === void 0 ? void 0 : _c.textContent) || ''; // Catégorie est à l'indice 4
                    const subCategory = ((_d = cells[5]) === null || _d === void 0 ? void 0 : _d.textContent) || ''; // Sous-catégorie est à l'indice 5
                    if ((name.includes(nameSearch) || nameSearch === '') &&
                        (category.includes(categorySelect) || categorySelect === '') &&
                        (subCategory.includes(subCategorySelect) || subCategorySelect === '')) {
                        row.style.display = '';
                    }
                    else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    }
    // Fonction pour gérer l'événement de la touche "Entrée" dans le champ de recherche
    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche le comportement par défaut du formulaire (si c'est un formulaire)
            filterResults();
        }
    }
    // Appel automatique de la fonction fetchData lors du chargement
    fetchData();
    // Gestion du clic sur le bouton de recherche
    const searchButton = document.getElementById('searchBtn');
    if (searchButton) {
        searchButton.addEventListener('click', filterResults);
    }
    const nameSearch = document.getElementById('nameSearch').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { // Vérifie si la touche pressée est "Entrée"
            event.preventDefault(); // Empêche l'action par défaut du formulaire
            fetchData(); // Appelle la fonction fetchData
        }
    });
    // Gestion du clic sur le bouton de fermeture
    const closeButton = document.getElementById('closePopup');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.close(); // Ferme la popup
        });
    }
    // Gestion du clic sur le bouton Fetch Data
    const fetchDataButton = document.getElementById('fetchData');
    if (fetchDataButton) {
        fetchDataButton.addEventListener('click', () => {
            fetchData(); // Récupère les données lorsque le bouton est cliqué
        });
    }
    // Gestion des onglets
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            if (target) {
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === target + 'Content');
                });
                tabs.forEach(t => t.classList.toggle('active', t === tab));
            }
        });
    });
    // Ajout du gestionnaire d'événements pour le champ de recherche
    const nameSearchInput = document.getElementById('nameSearch');
    if (nameSearchInput) {
        nameSearchInput.addEventListener('keypress', handleKeyPress);
    }
});
