// script.js
$(function() {
    $('#add-button').on('click', function () {
        var local_address = $('#add-input').val();
        $.ajax({
            url: 'http://127.0.0.1:808/lex/',
            method: 'POST',
            data: {
                lex_path: local_address,
            },
            success: function(response) {
                $.ajax({
                    url: 'http://127.0.0.1:808/add/',
                    method: 'POST',
                    data: {
                        dict: JSON.stringify(response),
                    },
                    success: function(response2) {
                        if (response2.status === 'success') {
                            $('#add-input').val('');
                            alert('add success');
                        } else {
                            alert('add failed');
                        }
                    },
                    error: function(data) {
                        console.log(data);
                    }
                });
            },
            error: function(data) {
                console.log(data);
            }
        });
    });
});
