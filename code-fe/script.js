// script.js
$(function() {
    let currentPage = 1;
    let currentQuery = '';
    const itemsPerPage = 20;

    $('#search-button').on('click', function() {
        const query = $('#search-input').val();
        if (query) {
            currentQuery = query;
            fetchResults(query, currentPage);
        }
    });

    function fetchResults(query, page) {
        $.ajax({
            url: 'http://127.0.0.1:808/search/',
            method: 'GET',
            data: {
                q: query,
                page: page,
            },
            success: function(response) {
                console.log(response);
                displayResults(response.data);
                setupPagination(response.total, page);
            },
            error: function(data) {
                console.log(data);
            }
        });
    }

    function displayResults(data) {
        const $resultsList = $('#results-list');
        $resultsList.empty();
        for (i in data) {
            var val = data[i];
            $resultsList.append(`<li>${val}</li>`)
        }
    }

    function setupPagination(totalItems, currentPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const $pagination = $('#pagination');
        $pagination.empty();

        for (let i = 1; i <= totalPages; i++) {
            const $button = $('<button>').text(i);
            if (i === currentPage) {
                $button.attr('disabled', true);
            }
            $button.on('click', function() {
                fetchResults(currentQuery, i);
            });
            $pagination.append($button);
        }
    }
});
