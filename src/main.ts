document.addEventListener('DOMContentLoaded', () => {
    // Fonction pour récupérer les données de l'API
    let listenersDone = false;

    async function fetchData() {
        console.log('Popup chargée, récupération des données...');
        try {

            const response = await fetch('https://api.kingdom.so/open/marketplace');
            const data = await response.json();
            console.log("Réponse brute de l'API:", data);

            // Remplir les sélecteurs avec les valeurs uniques
            populateSelects(data.toBuy);

            const buyTable = document.getElementById('buyTable') as HTMLTableElement;
            const sellTable = document.getElementById('sellTable') as HTMLTableElement;

            if (data.toBuy.length > 0) {
                populateTable(buyTable, data.toBuy, 'buy');
            } else {
                console.error("Les données 'toBuy' sont vides.");
            }

            if (data.toSell.length > 0) {
                populateTable(sellTable, data.toSell, 'sell');
            } else {
                console.error("Les données 'toSell' sont vides.");
            }
            filterResults();

        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        }
    }

    // Fonction pour remplir les sélecteurs avec les valeurs uniques
    function populateSelects(data: any[]) {
        const categorySelect = document.getElementById('categorySelect') as HTMLSelectElement;
        const subCategorySelect = document.getElementById('subCategorySelect') as HTMLSelectElement;

        const categories = new Set<string>();
        const subCategories = new Set<string>();

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
    function populateTable(table: HTMLTableElement, data: any[], type: 'buy' | 'sell') {
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
                    <td data-sort="name">${metadata?.title || 'N/A'}</td>
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
    function addSortListeners(table: HTMLTableElement) {
        if (!listenersDone) {
            console.log("test")
            const headers = table.querySelectorAll('thead th[data-sort]') as NodeListOf<HTMLTableHeaderCellElement>;
            headers.forEach(header => {
                header.addEventListener('click', () => {
                    const sortKey = header.getAttribute('data-sort');
                    if (sortKey) {
                        toggleSort(table, sortKey, header);
                    }
                });
            });
            listenersDone = true;
        }
    }

    // Fonction pour activer le tri multi-colonnes
    function toggleSort(table: HTMLTableElement, sortKey: string, header: HTMLTableHeaderCellElement) {
        const headers = table.querySelectorAll('thead th[data-sort]') as NodeListOf<HTMLTableHeaderCellElement>;

        // Mettre à jour les indicateurs de tri
        headers.forEach(th => {
            if (th !== header) {
                th.classList.remove('asc', 'desc');
                th.querySelector('.sort-indicator')?.classList.remove('asc', 'desc');
            }
        });

        // Gérer le tri multi-colonnes
        const sortDirections: Array<{ key: string, direction: 'asc' | 'desc' }> = Array.from(headers)
            .filter(th => th.classList.contains('asc') || th.classList.contains('desc'))
            .map(th => ({
                key: th.getAttribute('data-sort') || '',
                direction: th.classList.contains('asc') ? 'asc' : 'desc'
            }));

        const sortDirection: 'asc' | 'desc' = header.classList.contains('asc') ? 'desc' : 'asc';
        header.classList.toggle('asc', sortDirection === 'asc');
        header.classList.toggle('desc', sortDirection === 'desc');
        header.querySelector('.sort-indicator')?.classList.toggle('asc', sortDirection === 'asc');
        header.querySelector('.sort-indicator')?.classList.toggle('desc', sortDirection === 'desc');

        sortDirections.push({ key: sortKey, direction: sortDirection });

        sortTable(table, sortDirections);
    }

    // Fonction pour trier le tableau
    function sortTable(table: HTMLTableElement, sortDirections: { key: string, direction: 'asc' | 'desc' }[]) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
    
        const rowsArray = Array.from(tbody.querySelectorAll('tr'));
    
        rowsArray.sort((a, b) => {
            for (const { key, direction } of sortDirections) {
                const cellA = a.querySelector(`td[data-sort="${key}"]`)?.textContent?.trim() || '';
                const cellB = b.querySelector(`td[data-sort="${key}"]`)?.textContent?.trim() || '';
    
                let valueA: number | string = parseFloat(cellA.replace(/[^0-9.-]+/g, ''));
                let valueB: number | string = parseFloat(cellB.replace(/[^0-9.-]+/g, ''));
    
                if (isNaN(valueA)) valueA = cellA;
                if (isNaN(valueB)) valueB = cellB;
    
                if (valueA > valueB) return direction === 'asc' ? 1 : -1;
                if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            }
            return 0;
        });
    
        // Reconstruire le tableau en une seule opération
        const fragment = document.createDocumentFragment();
        rowsArray.forEach(row => fragment.appendChild(row));
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }
    function filterResults() {
        const nameSearch = (document.getElementById('nameSearch') as HTMLInputElement).value.toLowerCase();
        const categorySelect = (document.getElementById('categorySelect') as HTMLSelectElement).value;
        const subCategorySelect = (document.getElementById('subCategorySelect') as HTMLSelectElement).value;
    
        const tables = document.querySelectorAll('.tab-content.active table');
    
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody) {
                tbody.querySelectorAll('tr').forEach(row => {
                    const cells = row.querySelectorAll('td');
                    // Indices ajustés pour correspondre aux colonnes du tableau
                    const name = cells[1]?.textContent?.toLowerCase() || ''; // Nom est à l'indice 1
                    const category = cells[4]?.textContent || ''; // Catégorie est à l'indice 4
                    const subCategory = cells[5]?.textContent || ''; // Sous-catégorie est à l'indice 5
    
                    if (
                        (name.includes(nameSearch) || nameSearch === '') &&
                        (category.includes(categorySelect) || categorySelect === '') &&
                        (subCategory.includes(subCategorySelect) || subCategorySelect === '')
                    ) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    }

    // Fonction pour gérer l'événement de la touche "Entrée" dans le champ de recherche
    function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche le comportement par défaut du formulaire (si c'est un formulaire)
            filterResults();
        }
    }

    // Appel automatique de la fonction fetchData lors du chargement
    fetchData();

    // Gestion du clic sur le bouton de recherche
    const searchButton = document.getElementById('searchBtn') as HTMLButtonElement;
    if (searchButton) {
        searchButton.addEventListener('click', fetchData);
    }

    const nameSearch = document.getElementById('nameSearch')!.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') { // Vérifie si la touche pressée est "Entrée"
            event.preventDefault(); // Empêche l'action par défaut du formulaire
            fetchData(); // Appelle la fonction fetchData
        }
    });



    // Gestion du clic sur le bouton de fermeture
    const closeButton = document.getElementById('closePopup') as HTMLButtonElement;
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            window.close(); // Ferme la popup
        });
    }

    // Gestion du clic sur le bouton Fetch Data
    const fetchDataButton = document.getElementById('fetchData') as HTMLButtonElement;
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
    const nameSearchInput = document.getElementById('nameSearch') as HTMLInputElement;
    if (nameSearchInput) {
        nameSearchInput.addEventListener('keypress', handleKeyPress);
    }
});