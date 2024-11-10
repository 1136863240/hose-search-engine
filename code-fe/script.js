// script.js
$(function() {
    let currentPage = 1;
    let currentSavedPage = 1;
    let currentQuery = '';
    let historyIsExpand = false;
    let history = [];
    const $historyBody = $('#history-body');
    const itemsPerPage = 20;

    const savedHistory = localStorage.getItem('history');
    if (savedHistory) {
        history = savedHistory.split(',');
    }
    showHistory();

    $('#search-button').on('click', function() {
        const query = $('#search-input').val();
        if (query) {
            currentQuery = query;
            history.unshift(query);
            localStorage.setItem('history', history);
            showHistory();
            fetchResults(query, currentPage);
        }
    });

    $('#saved-button').on('click', function() {
        $.ajax({
            url: 'http://127.0.0.1:808/get_saved_paths/',
            method: 'GET',
            data: {
                page: currentSavedPage,
            },
            success: function(response) {
                console.log(response);
                displaySavedResults(response.data);
                const totalPages = Math.ceil(response.total / itemsPerPage);
                const $pagination = $('#pagination');
                $pagination.empty();

                for (let i = 1; i <= totalPages; i++) {
                    const $button = $('<button>').text(i);
                    if (i === currentPage) {
                        $button.attr('disabled', true);
                    }
                    $button.on('click', function() {
                        fetchSavedResults(i);
                    });
                    $pagination.append($button);
                }
            },
            error: function(data) {
                console.log(data);
            }
        });
    });

    $('#show_hidden').on('click', function () {
        if (historyIsExpand) {
            $('#history-list tr:nth-child(n+3)').css('display', 'none');
            $(this).text('展开');
            historyIsExpand = false;
        } else {
            $('#history-list tr:nth-child(n+3)').css('display', 'table-row');
            $(this).text('收起');
            historyIsExpand = true;
        }
    });

    function showHistory() {
        $historyBody.empty();
        for (var index in history) {
            const item = history[index];
            const $item = $('<td>');
            const $a = $('<a>').text(item);
            $a.attr('href', 'javascript:void(0);');
            $a.on('click', function () {
                var val = $(this).text();
                $('#search-input').val(val);
                fetchResults(val, 1);
            });
            $item.append($a);
            var body_children = $historyBody.children('tr');
            if (body_children.length === 0) {
                const $line = $('<tr>');
                $line.append($item);
                $historyBody.append($line);
            } else if ($(body_children[body_children.length - 1]).children().length >= 10) {
                const $line = $('<tr>');
                $line.append($item);
                $historyBody.append($line);
            } else {
                $(body_children[body_children.length - 1]).append($item);
            }
        }
    }

    function fetchResults(query, page) {
        $.ajax({
            url: 'http://127.0.0.1:808/search/',
            method: 'GET',
            data: {
                q: query,
                page: page,
            },
            success: function(response) {
                displayResults(response.data, true);
                setupPagination(response.total, page);
            },
            error: function(data) {
                console.log(data);
            }
        });
    }

    function fetchSavedResults(page) {
        $.ajax({
            url: 'http://127.0.0.1:808/get_saved_paths/',
            method: 'GET',
            data: {
                page: page,
            },
            success: function(response) {
                displaySavedResults(response.data);
                setupPagination(response.total, page);
            },
            error: function(data) {
                console.log(data);
            }
        });
    }

    function displayResults(data, need_save) {
        const $resultsList = $('#results-list');
        $resultsList.empty();
        for (i in data) {
            var val = data[i];
            save_button = '';
            if (need_save) {
                save_button = $(`<button id="save_${i}">`).text('收藏');
                save_button.on('click', function() {
                    var path_id = parseInt($(this).attr('id').substring(5));
                    var path = data[path_id];
                    $.ajax({
                        url: 'http://127.0.0.1:808/save_path/',
                        method: 'POST',
                        data: {
                            path: path,
                        },
                        success: function(response) {
                            console.log(response);
                            alert('收藏成功');
                        },
                        error: function(data) {
                            console.log(data);
                            alert('收藏失败');
                        }
                    });
                });
            }
            var item = $('<li>').text(val);
            item.append(save_button);
            $resultsList.append(item);
        }
    }

    function displaySavedResults(data) {
        const $resultsList = $('#results-list');
        $resultsList.empty();
        for (i in data) {
            var val = data[i];
            save_button = $(`<button id="del_save_${i}">`).text('取消收藏');
            save_button.on('click', function() {
                var path_id = parseInt($(this).attr('id').substring(9));
                var path = data[path_id];
                $.ajax({
                    url: 'http://127.0.0.1:808/del_save_path/',
                    method: 'POST',
                    data: {
                        path: path,
                    },
                    success: function(response) {
                        console.log(response);
                        fetchSavedResults(currentSavedPage);
                        alert('已取消收藏');
                    },
                    error: function(data) {
                        console.log(data);
                        alert('取消收藏失败');
                    }
                });
            });
            var item = $('<li>').text(val);
            item.append(save_button);
            $resultsList.append(item);
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
